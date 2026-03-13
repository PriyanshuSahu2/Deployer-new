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

	members, err := mc.Service.GetMembers(nil, userID, workspaceUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, members)
}
