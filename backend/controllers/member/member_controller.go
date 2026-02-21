package controller_member

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMembers(c *gin.Context) {

	userIDRaw, _ := c.Get("userID")
	userID, ok := userIDRaw.(uint)

	if !ok || userID == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	workspaceUUID := c.Param("workspaceUUID")

	if workspaceUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Workspace UUID is required"})
		return
	}

	var workspace models_workspace.Workspace

	workspaceResult := db.DB.First(&workspace, "uuid = ?", workspaceUUID)

	if workspaceResult.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace not found"})
		return
	}

	var members []models_workspace.WorkspaceMember

	result := db.DB.Preload("User").Preload("Role").Where("workspace_id = ?", workspace.ID).Find(&members)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve members"})
		return
	}

	var response []dtos_workspace.MemberResponseDTO
	for _, member := range members {
		if member.User.Name == "" {
			member.User.Name = member.User.Username
		}
		response = append(response, dtos_workspace.MemberResponseDTO{
			UserUUID:  member.User.UUID,
			UserEmail: member.User.Email,
			UserName:  member.User.Name,
			RoleName:  member.Role.RoleName,
			RoleUUID:  member.Role.UUID,
			InvitedBy: member.InvitedBy.Name,
		})
	}
	c.JSON(http.StatusOK, response)

}
