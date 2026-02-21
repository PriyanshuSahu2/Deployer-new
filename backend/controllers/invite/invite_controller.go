package controller_invite

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_auth "backend/models/auth"
	models_workspace "backend/models/workspace"
	"backend/services"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func GetWorkspaceInvites(c *gin.Context) {
	userIDRaw, _ := c.Get("userID")
	userID, ok := userIDRaw.(uint)

	if !ok || userID == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user."})
		return
	}

	workspaceUUID := c.Param("workspaceUUID")

	if workspaceUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get Workspace."})
		return
	}

	workspace, err := services.GetWorkspaceByUUID(workspaceUUID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get Workspace."})
		return
	}
	var invites []models_workspace.WorkspaceInvite
	result := db.DB.Where("workspace_id = ?", workspace.ID).Find(&invites)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve data."})
		return
	}

	var response []dtos_workspace.WorkspaceInviteResponseDTO

	for _, invite := range invites {
		var inviteDTO dtos_workspace.WorkspaceInviteResponseDTO
		inviteDTO.Email = invite.Email
		inviteDTO.WorkspaceName = invite.Workspace.WorkspaceName
		inviteDTO.Role = invite.Role.RoleName
		inviteDTO.InvitedBy = invite.Inviter.Username
		if invite.ExpiresAt.Before(time.Now()) {
			inviteDTO.Status = "expired"
		} else {
			inviteDTO.Status = "active"
		}
		response = append(response, inviteDTO)
	}

	if len(response) == 0 {
		c.JSON(http.StatusOK, []dtos_workspace.WorkspaceInviteResponseDTO{})
		return
	}
	c.JSON(http.StatusOK, response)

}

func GetWorkspaceInviteDetails(c *gin.Context) {
	token := strings.TrimSpace(c.Param("token"))
	var invite models_workspace.WorkspaceInvite
	result := db.DB.Preload("Workspace").Preload("Role").Preload("Inviter").Where("token = ?", token).First(&invite)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invite not found"})
		return
	}

	var response dtos_workspace.WorkspaceInviteResponseDTO
	response.Email = invite.Email
	response.WorkspaceName = invite.Workspace.WorkspaceName
	response.Role = invite.Role.RoleName
	response.InvitedBy = invite.Inviter.Username
	if invite.ExpiresAt.Before(time.Now()) {
		response.Status = "expired"
	} else {
		response.Status = "active"
	}

	c.JSON(http.StatusOK, response)
}
func AcceptWorkspaceInvite(c *gin.Context) {
	token := strings.TrimSpace(c.Param("token"))

	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	userIDRaw, _ := c.Get("userID")
	userID, ok := userIDRaw.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}
	var currentUser models_auth.User
	currentUserResult := db.DB.First(&currentUser, "id = ?", userID)
	if currentUserResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve current user"})
		return
	}

	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var invite models_workspace.WorkspaceInvite

	if err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("token = ? AND email = ?", token, currentUser.Email).
		First(&invite).Error; err != nil {

		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Invite not found"})
		return
	}

	if invite.Status != models_workspace.InvitePending {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite is not active"})
		return
	}

	if invite.ExpiresAt.Before(time.Now()) {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite expired"})
		return
	}

	var existing models_workspace.WorkspaceMember
	err := tx.Where(
		"workspace_id = ? AND user_id = ?",
		invite.WorkspaceID,
		userID,
	).First(&existing).Error

	if err == nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already a member"})
		return
	}

	invite.Status = models_workspace.InviteAccepted
	if err := tx.Save(&invite).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update invite"})
		return
	}

	newMember := models_workspace.WorkspaceMember{
		WorkspaceID: invite.WorkspaceID,
		UserId:      userID,
		RoleID:      invite.RoleID,
		Status:      "ACTIVE",
		InvitedByID: invite.InvitedByID,
	}

	if err := tx.Create(&newMember).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member"})
		return
	}
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "Invite accepted"})
}

func DeclineWorkspaceInvite(c *gin.Context) {
	token := strings.TrimSpace(c.Param("token"))

	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	userIDRaw := c.MustGet("userID")
	userID, ok := userIDRaw.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var invite models_workspace.WorkspaceInvite

	if err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("token = ?", token).
		First(&invite).Error; err != nil {

		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Invite not found"})
		return
	}

	if invite.Status != models_workspace.InvitePending {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite is not active"})
		return
	}

	if invite.ExpiresAt.Before(time.Now()) {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite expired"})
		return
	}

	var existing models_workspace.WorkspaceMember
	err := tx.Where(
		"workspace_id = ? AND user_id = ?",
		invite.WorkspaceID,
		userID,
	).First(&existing).Error

	if err == nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already a member"})
		return
	}

	invite.Status = models_workspace.InviteDeclined
	if err := tx.Save(&invite).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update invite"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "Invite declined"})
}

func GetUserInvites(c *gin.Context) {

	userIDRaw, _ := c.Get("userID")
	userID, ok := userIDRaw.(uint)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorised"})
		return
	}
	var user models_auth.User
	userResult := db.DB.First(&user, "id = ?", userID)
	if userResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve current user"})
		return
	}
	var invite []models_workspace.WorkspaceInvite

	result := db.DB.Where("email = ?", user.Email).Preload("Workspace").Preload("Role").Preload("Inviter").Find(&invite)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve invites"})
		return
	}

	var response []dtos_workspace.WorkspaceInviteResponseDTO

	for _, invite := range invite {
		var inviteDTO dtos_workspace.WorkspaceInviteResponseDTO
		inviteDTO.Email = invite.Email
		inviteDTO.WorkspaceName = invite.Workspace.WorkspaceName
		inviteDTO.Role = invite.Role.RoleName
		inviteDTO.InvitedBy = invite.Inviter.Username
		if invite.ExpiresAt.Before(time.Now()) {
			inviteDTO.Status = "expired"
		} else {
			inviteDTO.Status = "active"
		}
		response = append(response, inviteDTO)
	}

	if len(response) == 0 {
		c.JSON(http.StatusOK, []dtos_workspace.WorkspaceInviteResponseDTO{})
		return
	}
	c.JSON(http.StatusOK, response)

}
