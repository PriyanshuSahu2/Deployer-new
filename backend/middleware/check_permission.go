package middleware

import (
	"net/http"

	"backend/services"

	"github.com/gin-gonic/gin"
)

type PermissionMiddleware struct {
	roleService *services.RoleService
}

func NewPermissionMiddleware(roleService *services.RoleService) *PermissionMiddleware {
	return &PermissionMiddleware{
		roleService: roleService,
	}
}

func (m *PermissionMiddleware) RequirePermission(permissionKey string) gin.HandlerFunc {

	return func(c *gin.Context) {

		if permissionKey == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "permission not defined",
			})
			return
		}

		workspaceUUID := c.Param("workspaceUUID")
		if workspaceUUID == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "workspace not found",
			})
			return
		}

		userID := c.MustGet("userID").(uint)

		roleID, err := m.roleService.GetUserRoleID(workspaceUUID, int(userID))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "unable to fetch role",
			})
			return
		}
		hasPermission := m.roleService.RoleHasPermission(uint(roleID), permissionKey)
		if !hasPermission {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "permission denied",
			})
			return
		}

		c.Next()
	}
}
