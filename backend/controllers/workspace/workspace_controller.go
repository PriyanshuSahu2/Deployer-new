package controller_workspace

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateWorkspaceInternal(workspaceBody dtos_workspace.CreateWorkspaceDTO, userID uint) (models_workspace.Workspace, error) {
	newWorkspace := models_workspace.Workspace{
		WorkspaceName: workspaceBody.Name,
		OwnerID:       userID,
		CreatedByID:   userID,
	}
	result := db.DB.Create(&newWorkspace)
	return newWorkspace, result.Error
}

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

	workspace, err := CreateWorkspaceInternal(workspaceBody, c.GetUint("userID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create workspace"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Workspace created successfully", "workspace": workspace})
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

func ListWorkspaces(c *gin.Context) {
	var workspaces []models_workspace.Workspace
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in context"})
		return
	}
	result := db.DB.Joins("INNER JOIN workspace_members WM on WM.workspace_id = Workspaces.id").Where("WM.user_id = ?", userID).Find(&workspaces)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list workspaces"})
		return
	}
	workspaceDTO := make([]dtos_workspace.ListWorkspaceDTO, 0, len(workspaces))
	for _, w := range workspaces {
		workspaceDTO = append(workspaceDTO, dtos_workspace.ListWorkspaceDTO{
			UUID:      w.UUID,
			Name:      w.WorkspaceName,
			CreatedAt: w.CreatedAt,
			UpdatedAt: w.UpdatedAt,
		})
	}
	c.JSON(http.StatusOK, workspaceDTO)
}

func GetUserDefaultWorkspace(c *gin.Context) {
	var workspaces models_workspace.Workspace
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in context"})
		return
	}
	result := db.DB.Where("owner_id = ?", userID).Order("created_at DESC").Find(&workspaces)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list workspaces"})
		return
	}
	workspaceDTO := dtos_workspace.ListWorkspaceDTO{
		UUID:      workspaces.UUID,
		Name:      workspaces.WorkspaceName,
		CreatedAt: workspaces.CreatedAt,
		UpdatedAt: workspaces.UpdatedAt,
	}
	c.JSON(http.StatusOK, workspaceDTO)
}
