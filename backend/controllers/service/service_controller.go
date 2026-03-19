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

	body.ProjectUUID = ctx.Param("projectUUID")

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
