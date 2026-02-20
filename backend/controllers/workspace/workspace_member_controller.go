package controller_workspace

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_auth "backend/models/auth"
	models_role "backend/models/role"
	models_workspace "backend/models/workspace"
	"backend/services"
	"backend/utils"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func AddWorkspaceMemberInternal(addMemberDTO dtos_workspace.AddMemberDTOInternal) (models_workspace.WorkspaceMember, error) {
	status := "ACCEPTED"
	newMember := models_workspace.WorkspaceMember{
		UserId:      addMemberDTO.UserID,
		RoleID:      addMemberDTO.RoleID,
		WorkspaceID: addMemberDTO.WorkspaceID,
		InvitedByID: addMemberDTO.InvitedByID,
		Status:      status,
	}
	newMemberResult := db.DB.Create(&newMember)
	return newMember, newMemberResult.Error
}

func InviteMemberToWorkspace(workspaceID uint, email string, token string, userID uint, roleID uint, invitedByID uint) (models_workspace.WorkspaceInvite, error) {
	newInvite := models_workspace.WorkspaceInvite{
		WorkspaceID: workspaceID,
		Email:       email,
		RoleID:      roleID,
		Token:       token,
		Status:      "PENDING",
		ExpiresAt:   time.Now().Add(24 * time.Hour),
		InvitedByID: invitedByID,
	}
	newInviteResult := db.DB.Create(&newInvite)
	return newInvite, newInviteResult.Error
}

// AddWorkspaceMember godoc
// @Summary      Invite a user to a workspace
// @Description  Invite an existing user to join a workspace with a specific role. An invitation email will be sent to the user.
// @Tags         Workspace Members
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        payload  body      dtos_workspace.AddMemberDTO  true  "Add workspace member payload"
// @Success      200  {object}  map[string]string  "Member invited successfully"
// @Failure      400  {object}  map[string]string  "Invalid request or resource not found"
// @Failure      401  {object}  map[string]string  "Unauthorized"
// @Failure      403  {object}  map[string]string  "Forbidden - insufficient permissions"
// @Failure      409  {object}  map[string]string  "User already exists in workspace"
// @Failure      500  {object}  map[string]string  "Internal server error"
// @Router       /workspace/invite-member [post]
func AddWorkspaceMember(c *gin.Context) {

	var memberBody dtos_workspace.AddMemberDTO

	if err := c.ShouldBindJSON(&memberBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var foundUser models_auth.User
	result := db.DB.Where("uuid = ? OR email = ?", memberBody.UserUUID, memberBody.UserEmail).First(&foundUser)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found."})
		return
	}

	var workspace models_workspace.Workspace
	workspaceResult := db.DB.Where("uuid = ?", memberBody.WorkspaceUUID).First(&workspace)
	if errors.Is(workspaceResult.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Workspace not found."})
		return
	}
	var role models_role.Role
	roleResult := db.DB.Where("uuid = ?", memberBody.RoleUUID).First(&role)

	if errors.Is(roleResult.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role not found."})
		return
	}

	// addMemberDTOInternal := dtos_workspace.AddMemberDTOInternal{
	// 	WorkspaceID: workspace.ID,
	// 	UserID:      foundUser.ID,
	// 	RoleID:      role.ID,
	// 	InvitedByID: c.GetUint("userID"),
	// }

	token, err := utils.GenerateSecureToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate secure token"})
		return
	}
	_, inviteErr := InviteMemberToWorkspace(workspace.ID, foundUser.Email, token, foundUser.ID, role.ID, c.GetUint("userID"))

	if inviteErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member to workspace"})
		return
	}

	var currentUser models_auth.User
	currentUserResult := db.DB.First(&currentUser, "id = ?", c.GetUint("userID"))
	if currentUserResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve current user"})
		return
	}
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	invitationLink := string(frontendURL) + "/workspace/invite?token=" + token

	go services.NewEmailService().SendWorkspaceInvitation(foundUser.Email, string(currentUser.Name), string(workspace.WorkspaceName), invitationLink)

	c.JSON(http.StatusOK, gin.H{"message": "Member invited successfully."})
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
