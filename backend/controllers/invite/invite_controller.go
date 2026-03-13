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

	invites, err := ic.Service.GetWorkspaceInvites(nil, userID, workspaceUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invites)
}

func (ic *InviteController) GetWorkspaceInviteDetails(c *gin.Context) {
	token := strings.TrimSpace(c.Param("token"))

	invite, err := ic.Service.GetInviteDetails(nil, token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invite)
}

func (ic *InviteController) AcceptWorkspaceInvite(c *gin.Context) {
	token := strings.TrimSpace(c.Param("token"))

	if err := ic.Service.AcceptInvite(nil, token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invite accepted"})
}

func (ic *InviteController) DeclineWorkspaceInvite(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	token := strings.TrimSpace(c.Param("token"))

	if err := ic.Service.DeclineInvite(nil, userID, token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invite declined"})
}

func (ic *InviteController) GetUserInvites(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	invites, err := ic.Service.GetUserInvites(nil, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invites)
}