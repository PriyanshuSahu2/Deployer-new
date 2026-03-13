package middleware

import (
	"net/http"

	"backend/repositories"
	"backend/services"

	"github.com/gin-gonic/gin"
)

type PermissionMiddleware struct {
	roleService   *services.RoleService
	workspaceRepo *repositories.WorkspaceRepository
}

func NewPermissionMiddleware(roleService *services.RoleService, workspaceRepo *repositories.WorkspaceRepository) *PermissionMiddleware {
	return &PermissionMiddleware{
		roleService:   roleService,
		workspaceRepo: workspaceRepo,
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

		workspace, err := m.workspaceRepo.GetByUUID(nil, workspaceUUID)
		if err == nil && workspace.OwnerID == userID {
			c.Next()
			return
		}

		roleID, err := m.roleService.GetUserRoleID(nil, workspaceUUID, int(userID))
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: User not in workspace"})
			c.Abort()
			return
		}
		hasPermission := m.roleService.RoleHasPermission(nil, uint(roleID), permissionKey)
		if !hasPermission {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "permission denied",
			})
			return
		}

		c.Next()
	}
}
