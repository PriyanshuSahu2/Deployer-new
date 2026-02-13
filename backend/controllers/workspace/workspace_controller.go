package workspace_controller

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateWorkspace godoc
// @Summary      Create a new workspace
// @Description  Create a workspace for the authenticated user
// @Tags         Workspace
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        workspace  body      dtos_workspace.CreateWorkspaceDTO  true  "Workspace payload"
// @Success      200  {object}  map[string]string  "Workspace created successfully"
// @Failure      400  {object}  map[string]string  "Invalid request body"
// @Failure      401  {object}  map[string]string  "Unauthorized"
// @Failure      500  {object}  map[string]string  "Failed to create workspace"
// @Router       /workspace [post]
func CreateWorkspace(c *gin.Context) {
	var workspaceBody dtos_workspace.CreateWorkspaceDTO

	if err := c.ShouldBindJSON(&workspaceBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newWorkspace := models_workspace.Workspace{
		WorkspaceName: workspaceBody.Name,
		OwnerID:       c.GetUint("userID"),
	}
	result := db.DB.Create(&newWorkspace)
	if err := result.Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create workspace"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Workspace created successfully"})
}

func UpdateWorkspace(c *gin.Context) {
	var workspaceBody dtos_workspace.UpdateWorkspaceDTO

	if err := c.ShouldBindJSON(&workspaceBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var workspace models_workspace.Workspace
	result := db.DB.Where("uuid = ? AND owner_id = ?", workspaceBody.UUID, c.GetUint("userID")).First(&workspace)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace not found"})
		return
	}

	workspace.WorkspaceName = workspaceBody.Name
	saveResult := db.DB.Save(&workspace)
	if saveResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update workspace"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workspace updated successfully"})

}
