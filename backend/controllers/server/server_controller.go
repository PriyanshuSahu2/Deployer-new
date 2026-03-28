package controller_server

import (
	"net/http"
	"strconv"

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

func (sc *ServerController) TestConnection(c *gin.Context) {
	var body dtos_server.TestConnectionDTO
	
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := sc.Service.TestConnection(body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Connection Tested Successfully"})
}

func (sc *ServerController) CheckPortAvailability(c *gin.Context) {
	serverUUID := c.Param("uuid")
	portStr := c.Query("port")

	port, err := strconv.Atoi(portStr)
	if err != nil || port <= 0 || port > 65535 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid port number"})
		return
	}

	available, err := sc.Service.CheckPortAvailability(serverUUID, port)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"available": available})
}

	