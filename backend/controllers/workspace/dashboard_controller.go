package controller_workspace

import (
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	DashboardService *services.DashboardService
}

func NewDashboardController(dashboardService *services.DashboardService) *DashboardController {
	return &DashboardController{
		DashboardService: dashboardService,
	}
}

func (c *DashboardController) GetDashboardStats(ctx *gin.Context) {
	workspaceUUID := ctx.Param("workspaceUUID")
	if workspaceUUID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "workspaceUUID is required"})
		return
	}

	stats, err := c.DashboardService.GetDashboardStats(nil, workspaceUUID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, stats)
}

func (c *DashboardController) GetWorkspaceDeployments(ctx *gin.Context) {
	workspaceUUID := ctx.Param("workspaceUUID")
	if workspaceUUID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "workspaceUUID is required"})
		return
	}

	deployments, err := c.DashboardService.GetWorkspaceDeployments(nil, workspaceUUID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, deployments)
}

func (c *DashboardController) GetDeploymentLogs(ctx *gin.Context) {
	workspaceUUID := ctx.Param("workspaceUUID")
	deploymentUUID := ctx.Param("deploymentUUID")

	if workspaceUUID == "" || deploymentUUID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "workspaceUUID and deploymentUUID are required"})
		return
	}

	logs, err := c.DashboardService.GetDeploymentLogs(nil, workspaceUUID, deploymentUUID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"logs": logs})
}
