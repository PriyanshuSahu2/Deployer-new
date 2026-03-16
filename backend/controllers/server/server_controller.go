package controller_server

import (
	"net/http"

	dtos_server "backend/dtos/server"
	"backend/services"

	"github.com/gin-gonic/gin"
)

type ServerController struct {
	Service *services.ServerService
}

func NewServerController(service *services.ServerService) *ServerController {
	return &ServerController{Service: service}
}

func (sc *ServerController) CreateServer(c *gin.Context) {
	var body dtos_server.CreateServerDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := sc.Service.CreateServer(c.MustGet("userID").(uint), c.Param("workspaceUUID"), body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Server Created Successfully"})
}

func (sc *ServerController) UpdateServer(c *gin.Context) {
	var body dtos_server.UpdateServerDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	body.UUID = c.Param("uuid")

	if err := sc.Service.UpdateServer(c.MustGet("userID").(uint), body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Server Updated Successfully"})
}

func (sc *ServerController) ListServers(c *gin.Context) {
	servers, err := sc.Service.ListServers(c.MustGet("userID").(uint), c.Param("workspaceUUID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, servers)
}

func (sc *ServerController) DeleteServer(c *gin.Context) {
	if err := sc.Service.DeleteServer(c.MustGet("userID").(uint), c.Param("uuid")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Server Deleted Successfully"})
}
