package controller_workspace

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_auth "backend/models/auth"
	models_role "backend/models/role"
	models_workspace "backend/models/workspace"
	"backend/services"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddWorkspaceMemberInternal(addMemberDTO dtos_workspace.AddMemberDTOInternal) (models_workspace.WorkspaceMember, error) {
	status := "ACCEPTED"
	if addMemberDTO.InvitedByID != 0 {
		status = "INVITED"
	}

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
// @Router       /workspace/members [post]
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

	addMemberDTOInternal := dtos_workspace.AddMemberDTOInternal{
		WorkspaceID: workspace.ID,
		UserID:      foundUser.ID,
		RoleID:      role.ID,
		InvitedByID: c.GetUint("userID"),
	}

	_, err := AddWorkspaceMemberInternal(addMemberDTOInternal)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member to workspace"})
		return
	}

	var currentUser models_auth.User
	currentUserResult := db.DB.First(&currentUser, "id = ?", c.GetUint("userID"))
	if currentUserResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve current user"})
		return
	}

	go services.NewEmailService().SendWorkspaceInvitation(foundUser.Email, string(currentUser.Name), string(workspace.WorkspaceName), "something")

	c.JSON(http.StatusOK, gin.H{"message": "Member added successfully."})
}
