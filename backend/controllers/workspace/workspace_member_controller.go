package controller_workspace

import (
	"net/http"

	dtos_workspace "backend/dtos/workspace"
	"backend/services"

	"github.com/gin-gonic/gin"
)

type WorkspaceMemberController struct {
	Service *services.WorkspaceMemberService
}

func NewWorkspaceMemberController(service *services.WorkspaceMemberService) *WorkspaceMemberController {
	return &WorkspaceMemberController{Service: service}
}

func (wc *WorkspaceMemberController) AddWorkspaceMember(c *gin.Context) {
	var body dtos_workspace.AddMemberDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	userID := c.GetUint("userID")

	if err := wc.Service.InviteMember(userID, body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member invited successfully."})
}

