package controller_workspace

import (
	"net/http"

	dtos_workspace "backend/dtos/workspace"
	"backend/services"

	"github.com/gin-gonic/gin"
)

type WorkspaceController struct {
	Service *services.WorkspaceService
}

func NewWorkspaceController(service *services.WorkspaceService) *WorkspaceController {
	return &WorkspaceController{Service: service}
}

func (wc *WorkspaceController) CreateWorkspace(c *gin.Context) {
	var workspaceBody dtos_workspace.CreateWorkspaceDTO

	if err := c.ShouldBindJSON(&workspaceBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetUint("userID")

	workspace, err := wc.Service.CreateWorkspace(nil, userID, workspaceBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Workspace created successfully",
		"workspace": workspace,
	})
}

func (wc *WorkspaceController) UpdateWorkspace(c *gin.Context) {
	var workspaceBody dtos_workspace.UpdateWorkspaceDTO

	if err := c.ShouldBindJSON(&workspaceBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetUint("userID")

	if err := wc.Service.UpdateWorkspace(nil, userID, workspaceBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workspace updated successfully"})
}

func (wc *WorkspaceController) ListWorkspaces(c *gin.Context) {
	userID := c.GetUint("userID")

	workspaces, err := wc.Service.ListWorkspaces(nil, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workspaces)
}

func (wc *WorkspaceController) GetUserDefaultWorkspace(c *gin.Context) {
	userID := c.GetUint("userID")

	workspace, err := wc.Service.GetUserDefaultWorkspace(nil, userID)
	if err != nil {
		if err.Error() == "record not found" || err.Error() == "workspace not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "No workspaces found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workspace)
}
func (wc *WorkspaceController) GetMyWorkspacePermissions(c *gin.Context) {

	workspaceUUID := c.Param("workspaceUUID")
	userID := c.MustGet("userID").(uint)

	permissions, err := wc.Service.GetUserPermissions(nil, workspaceUUID, int(userID))
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch permissions"})
		return
	}

	c.JSON(200, gin.H{
		"permissions": permissions,
	})
}
