package controller_roles

import (
	"net/http"

	dtos_roles "backend/dtos/roles"
	"backend/services"

	"github.com/gin-gonic/gin"
)

type RoleController struct {
	Service *services.RoleService
}

func NewRoleController(service *services.RoleService) *RoleController {
	return &RoleController{Service: service}
}

func (rc *RoleController) CreateRole(c *gin.Context) {
	var roleBody dtos_roles.CreateRoleDTO

	if err := c.ShouldBindJSON(&roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := rc.Service.CreateRole(c.MustGet("userID").(uint), roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Role Created Successfully"})
}

func (rc *RoleController) UpdateRole(c *gin.Context) {
	var roleBody dtos_roles.UpdateRoleDTO

	if err := c.ShouldBindJSON(&roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := rc.Service.UpdateRole(c.MustGet("userID").(uint), roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role Updated Successfully"})
}

func (rc *RoleController) ListRoles(c *gin.Context) {
	workspaceUUID := c.Param("workspaceUUID")
	userID := c.MustGet("userID").(uint)

	roles, err := rc.Service.ListRoles(userID, workspaceUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}
