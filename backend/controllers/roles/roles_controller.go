package controller_roles

import (
	"fmt"
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

	if err := rc.Service.CreateRole(nil, c.MustGet("userID").(uint), roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Role Created Successfully"})
}

func (rc *RoleController) UpdateRole(c *gin.Context) {
	uuid := c.Param("uuid")
	userID := c.MustGet("userID").(uint)

	var roleBody dtos_roles.UpdateRoleDTO

	if err := c.ShouldBindJSON(&roleBody); err != nil {
		fmt.Println("BIND ERROR UpdateRole:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roleBody.UUID = uuid

	if err := rc.Service.UpdateRole(nil, userID, roleBody); err != nil {
		fmt.Println("SERVICE ERROR UpdateRole:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role Updated Successfully"})
}

func (rc *RoleController) ListRoles(c *gin.Context) {
	workspaceUUID := c.Param("workspaceUUID")
	userID := c.MustGet("userID").(uint)

	roles, err := rc.Service.ListRoles(nil, userID, workspaceUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}

func (rc *RoleController) DeleteRole(c *gin.Context) {
	roleUUID := c.Param("uuid")
	userID := c.MustGet("userID").(uint)

	if err := rc.Service.DeleteRole(nil, userID, roleUUID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role Deleted Successfully"})
}

func (rc *RoleController) AssignPermission(c *gin.Context) {
	var body dtos_roles.UpdateRolePermissionsDTO
	roleUUID := c.Param("roleUUID")
	if roleUUID == "" {
		roleUUID = c.Param("uuid")
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rows, err := rc.Service.UpdateRolePermissions(nil, c.MustGet("userID").(uint), roleUUID, body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rows)
}

func (rc *RoleController) ListRolePermissions(c *gin.Context) {
	roleUUID := c.Param("roleUUID")
	permissions, err := rc.Service.ListRolePermissions(nil, c.MustGet("userID").(uint), roleUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, permissions)
}

// project:read project:write project:update project:delete
