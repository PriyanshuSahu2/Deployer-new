package controller_service

import (
	dtos_service "backend/dtos/service"
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ServiceController struct {
	Service *services.ServiceService
}

func NewServiceController(service *services.ServiceService) *ServiceController {
	return &ServiceController{Service: service}
}

func (c *ServiceController) CreateService(ctx *gin.Context) {
	var body dtos_service.CreateServiceDTO

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	body.ProjectUUID = ctx.Param("uuid")

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	serviceResponse, err := c.Service.CreateService(nil, userID.(uint), body.ProjectUUID, body)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, serviceResponse)
}

func (c *ServiceController) GetServicesByProject(ctx *gin.Context) {
	projectUUID := ctx.Param("uuid")

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	services, err := c.Service.GetServicesByProject(nil, userID.(uint), projectUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Returning empty array instead of null when services are nil
	if services == nil {
		services = []dtos_service.ServiceCreationResponseDTO{}
	}

	ctx.JSON(http.StatusOK, services)
}

func (c *ServiceController) TriggerDeployment(ctx *gin.Context) {
	serviceUUID := ctx.Param("serviceUUID")
	workspaceUUID := ctx.Param("workspaceUUID")

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	_ = userID // Ignore for now since logic is empty

	err := c.Service.TriggerDeployment(nil, serviceUUID, workspaceUUID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Deployment triggered successfully"})
}
