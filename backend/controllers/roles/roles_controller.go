package roles_controller

import (
	"backend/db"
	dtos_roles "backend/dtos/roles"
	models_role "backend/models/role"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateRole(c *gin.Context) {

	var roleBody dtos_roles.CreateRoleDTO

	if err := c.ShouldBindJSON(&roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error})
		return
	}

	newRole := models_role.Role{
		RoleName:    roleBody.RoleName,
		WorkspaceID: roleBody.WorkspaceID,
	}

	result := db.DB.Create(&newRole)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Role Created Successfully"})

}

func UpdateRole(c *gin.Context) {

	var roleBody dtos_roles.UpdateRoleDTO
	if err := c.ShouldBindJSON(&roleBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error})
		return
	}

	var foundRole models_role.Role

	result := db.DB.Where("uuid = ?", roleBody.UUID).First(&foundRole)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Role Not Found",
		})
		return
	}

	foundRole.RoleName = roleBody.RoleName

	result = db.DB.Save(&foundRole)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": result.Error,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Role Updated Successfully",
	})

}
