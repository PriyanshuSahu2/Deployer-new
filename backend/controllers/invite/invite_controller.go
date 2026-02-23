package controller_invite

import (
	"net/http"
	"strings"

	"backend/services"

	"github.com/gin-gonic/gin"
)

type InviteController struct {
	Service *services.InviteService
}

func NewInviteController(service *services.InviteService) *InviteController {
	return &InviteController{Service: service}
}

func (ic *InviteController) GetWorkspaceInvites(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	workspaceUUID := c.Param("workspaceUUID")

	response, err := ic.Service.GetWorkspaceInvites(userID, workspaceUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (ic *InviteController) GetWorkspaceInviteDetails(c *gin.Context) {
	token := strings.TrimSpace(c.Param("token"))

	response, err := ic.Service.GetInviteDetails(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (ic *InviteController) AcceptWorkspaceInvite(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	token := strings.TrimSpace(c.Param("token"))

	if err := ic.Service.AcceptInvite(userID, token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invite accepted"})
}

func (ic *InviteController) DeclineWorkspaceInvite(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	token := strings.TrimSpace(c.Param("token"))

	if err := ic.Service.DeclineInvite(userID, token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invite declined"})
}

func (ic *InviteController) GetUserInvites(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	response, err := ic.Service.GetUserInvites(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}