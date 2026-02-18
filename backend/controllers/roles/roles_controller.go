package controller_roles

import (
	"backend/db"
	dtos_roles "backend/dtos/roles"
	models_role "backend/models/role"
	models_workspace "backend/models/workspace"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateRole godoc
// @Summary      Create a new role
// @Description  Create a role inside a workspace
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Param        role  body  dtos_roles.CreateRoleDTO  true  "Create Role DTO"
// @Success      201   {object}  map[string]string
// @Failure      400   {object}  map[string]string
// @Router       /roles [post]
func CreateRole(c *gin.Context) {

	var roleBody dtos_roles.CreateRoleDTO

	if err := c.ShouldBindJSON(&roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newRole := models_role.Role{
		RoleName:    roleBody.RoleName,
		WorkspaceID: roleBody.WorkspaceID,
		CreatedByID: *roleBody.WorkspaceID,
	}

	result := db.DB.Create(&newRole)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Role Created Successfully"})
}

// UpdateRole godoc
// @Summary      Update role
// @Description  Update role name using role UUID
// @Tags         Roles
// @Accept       json
// @Produce      json
// @Param        role  body  dtos_roles.UpdateRoleDTO  true  "Update Role DTO"
// @Success      200   {object}  map[string]string
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Router       /roles [put]
func UpdateRole(c *gin.Context) {

	var roleBody dtos_roles.UpdateRoleDTO
	if err := c.ShouldBindJSON(&roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var foundRole models_role.Role

	result := db.DB.Where("uuid = ?", roleBody.UUID).First(&foundRole)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role Not Found"})
		return
	}

	foundRole.RoleName = roleBody.RoleName

	result = db.DB.Save(&foundRole)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role Updated Successfully"})
}

// ListRoles godoc
// @Summary      List roles
// @Description  Get all roles for a workspace
// @Tags         Roles
// @Produce      json
// @Success      200  {array}   models_role.Role
// @Failure      500  {object}  map[string]string
// @Router       /roles [get]
func ListRoles(c *gin.Context) {

	var roles []models_role.Role
	workspaceUUID := c.Param("workspaceUUID")
	var workspace models_workspace.Workspace
	workspaceResult := db.DB.Where("uuid = ?", workspaceUUID).First(&workspace)
	if workspaceResult.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace Not Found"})
		return
	}
	result := db.DB.Where("workspace_id = ? OR is_system = ?", workspace.ID, true).Find(&roles)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list roles"})
		return
	}
	RoleResponseDTOs := make([]dtos_roles.RoleResponseDTO, len(roles))
	for i, role := range roles {
		RoleResponseDTOs[i] = dtos_roles.RoleResponseDTO{
			UUID:      role.UUID,
			RoleName:  role.RoleName,
			CreatedAt: role.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	c.JSON(http.StatusOK, RoleResponseDTOs)
}
