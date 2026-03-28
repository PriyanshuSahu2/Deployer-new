package routes

import (
	controller_server "backend/controllers/server"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func ServerRoutes(r *gin.Engine, workspaceRoute *gin.RouterGroup, serverController *controller_server.ServerController, permissionMiddleWare *middleware.PermissionMiddleware) {
	servers := workspaceRoute.Group("/servers")

	servers.Use(middleware.ValidateRequest())
	{
		servers.GET("", permissionMiddleWare.RequirePermission("server:read"), serverController.ListServers)
		servers.POST("", permissionMiddleWare.RequirePermission("server:create"), serverController.CreateServer)
		servers.PUT("/:uuid", permissionMiddleWare.RequirePermission("server:update"), serverController.UpdateServer)
		servers.DELETE("/:uuid", permissionMiddleWare.RequirePermission("server:delete"), serverController.DeleteServer)
		servers.POST("/test-connection", serverController.TestConnection)
		servers.GET("/:uuid/ports/check", permissionMiddleWare.RequirePermission("server:read"), serverController.CheckPortAvailability)
	}
}
