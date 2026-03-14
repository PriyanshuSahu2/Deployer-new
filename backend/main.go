package main

import (
	"backend/container"
	"backend/db"
	models_auth "backend/models/auth"
	models_oauth "backend/models/oauth"
	models_permission "backend/models/permission"
	models_project "backend/models/project"
	models_role "backend/models/role"
	models_role_permission "backend/models/role_permission"
	models_workspace "backend/models/workspace"
	models_integration "backend/models/integrations"
	"backend/rabbitmq"
	redisclient "backend/redis"
	"backend/routes"
	"backend/services"

	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	_ "backend/docs"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func init() {
	godotenv.Load()
}

func main() {

	gin.SetMode(gin.DebugMode)

	r := gin.Default()
	r.Use(gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	/* ---------------- INFRA SETUP ---------------- */

	db.ConnectToDB()
	redisclient.ConnectRedis()

	rabbitURL := os.Getenv("RABBITMQ_URL")

	rmq, err := rabbitmq.NewRabbitMQ(rabbitURL)
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ:", err)
	}

	err = rmq.DeclareTopology()
	if err != nil {
		log.Fatal("Failed to declare topology:", err)
	}

	defer rmq.Close()

	emailService := services.NewEmailService(rmq)

	/* ---------------- MIGRATIONS ---------------- */

	db.DB.AutoMigrate(
		&models_auth.User{},
		&models_oauth.OAuthToken{},
		&models_auth.OTP{},
		&models_workspace.Workspace{},
		&models_workspace.WorkspaceMember{},
		&models_permission.Permission{},
		&models_project.Project{},
		&models_role.Role{},
		&models_workspace.WorkspaceInvite{},
		&models_role_permission.RolePermission{},
		&models_integration.WorkspaceGitIntegration{},
	)

	/* ---------------- CONTAINER ---------------- */

	c := container.NewContainer(emailService)

	/* ---------------- ROUTES ---------------- */

	routes.AuthRoutes(r, c.AuthController)

	workspaceRoute := routes.WorkspaceRoutes(
		r,
		c.WorkspaceController,
		c.WorkspaceMemberController,
		c.IntegrationController,
		c.PermissionMW,
	)

	routes.RoleRoutes(
		r,
		workspaceRoute,
		c.RoleController,
		c.PermissionMW,
	)

	routes.ProjectRoutes(
		r,
		workspaceRoute,
		c.ProjectController,
		c.PermissionMW,
	)

	routes.InviteRoutes(
		r,
		workspaceRoute,
		c.InviteController,
		c.PermissionMW,
	)

	routes.MemberRoutes(
		r,
		workspaceRoute,
		c.MemberController,
		c.PermissionMW,
	)

	/* ---------------- HEALTH ROUTES ---------------- */

	r.GET("/", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status":  200,
			"message": "Working",
		})
	})

	r.GET("/status", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status":  200,
			"message": "Working",
		})
	})

	r.GET("/refresh-token", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "Good",
		})
	})

	/* ---------------- SWAGGER ---------------- */

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	/* ---------------- SERVER ---------------- */

	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
