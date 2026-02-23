package controller_member

import (
	"net/http"

	"backend/services"

	"github.com/gin-gonic/gin"
)

type MemberController struct {
	Service *services.MemberService
}

func NewMemberController(service *services.MemberService) *MemberController {
	return &MemberController{Service: service}
}

func (mc *MemberController) GetMembers(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	workspaceUUID := c.Param("workspaceUUID")

	if workspaceUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Workspace UUID is required"})
		return
	}

	response, err := mc.Service.GetMembers(userID, workspaceUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
