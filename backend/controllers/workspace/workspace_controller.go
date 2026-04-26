package controller_workspace

import (
	"errors"
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

func (wc *WorkspaceController) GetWorkspaceSettings(c *gin.Context) {
	workspaceUUID := c.Param("workspaceUUID")
	userID := c.GetUint("userID")

	settings, err := wc.Service.GetWorkspaceSettings(nil, userID, workspaceUUID)
	if err != nil {
		writeWorkspaceError(c, err)
		return
	}

	c.JSON(http.StatusOK, settings)
}

func (wc *WorkspaceController) UpdateWorkspaceSettings(c *gin.Context) {
	var body dtos_workspace.UpdateWorkspaceSettingsDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := wc.Service.UpdateWorkspaceSettings(nil, c.GetUint("userID"), c.Param("workspaceUUID"), body); err != nil {
		writeWorkspaceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workspace settings updated successfully"})
}

func (wc *WorkspaceController) CreateWorkspaceAPIKey(c *gin.Context) {
	var body dtos_workspace.CreateWorkspaceAPIKeyDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	key, err := wc.Service.CreateWorkspaceAPIKey(nil, c.GetUint("userID"), c.Param("workspaceUUID"), body)
	if err != nil {
		writeWorkspaceError(c, err)
		return
	}

	c.JSON(http.StatusCreated, key)
}

func (wc *WorkspaceController) RevokeWorkspaceAPIKey(c *gin.Context) {
	if err := wc.Service.RevokeWorkspaceAPIKey(nil, c.GetUint("userID"), c.Param("workspaceUUID"), c.Param("keyUUID")); err != nil {
		writeWorkspaceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "API key revoked successfully"})
}

func (wc *WorkspaceController) TransferOwnership(c *gin.Context) {
	var body dtos_workspace.TransferOwnershipDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := wc.Service.TransferOwnership(nil, c.GetUint("userID"), c.Param("workspaceUUID"), body); err != nil {
		writeWorkspaceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workspace ownership transferred successfully"})
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

func writeWorkspaceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, services.ErrWorkspaceForbidden):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
	case errors.Is(err, services.ErrWorkspaceNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case errors.Is(err, services.ErrWorkspaceMemberMissing):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	case errors.Is(err, services.ErrWorkspaceSelfTransfer):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
}
