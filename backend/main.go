package main

import (
	"backend/container"
	"backend/db"
	models_auth "backend/models/auth"
	models_integration "backend/models/integrations"
	models_oauth "backend/models/oauth"
	models_permission "backend/models/permission"
	models_project "backend/models/project"
	models_role "backend/models/role"
	models_role_permission "backend/models/role_permission"
	models_server "backend/models/server"
	models_service "backend/models/service"
	models_workspace "backend/models/workspace"
	"backend/rabbitmq"
	redisclient "backend/redis"
	"backend/routes"
	"backend/services"
	"backend/worker"

	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	godotenv.Load()
}

func main() {

	mode := os.Getenv("GIN_MODE")
	if mode == "" {
		mode = gin.DebugMode
	}
	gin.SetMode(mode)

	r := gin.Default()
	r.Use(gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"https://deployer.myapico.live",
			"http://deployer.myapico.live",
			"https://www.deployer.myapico.live",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"},
		AllowHeaders: []string{
			"Origin",
			"Content-Length",
			"Content-Type",
			"Authorization",
			"Accept",
			"X-Requested-With",
			"Access-Control-Request-Method",
			"Access-Control-Request-Headers",
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	/* ---------------- INFRA SETUP ---------------- */

	db.ConnectToDB()
	redisclient.ConnectRedis()

	rabbitURL := os.Getenv("RABBITMQ_URL")

	var rmq *rabbitmq.RabbitMQ
	var err error
	for i := 0; i < 5; i++ {
		rmq, err = rabbitmq.NewRabbitMQ(rabbitURL)
		if err == nil {
			break
		}
		log.Printf("RabbitMQ unavailable, retrying in 3 seconds... (%d/5)\n", i+1)
		time.Sleep(3 * time.Second)
	}
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ after retries:", err)
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
		&models_workspace.WorkspaceAPIKey{},
		&models_permission.Permission{},
		&models_project.Project{},
		&models_role.Role{},
		&models_workspace.WorkspaceInvite{},
		&models_role_permission.RolePermission{},
		&models_integration.WorkspaceGitIntegration{},
		&models_server.Server{},
		&models_service.Service{},
		&models_service.ServiceGitConfig{},
		&models_service.ServiceEnvVariable{},
		&models_service.Deployment{},
	)

	/* ---------------- CONTAINER ---------------- */

	c := container.NewContainer(emailService, rmq)

	/* ---------------- WORKERS ---------------- */

	go worker.StartEmailConsumer(rmq, emailService)
	go worker.StartDeploymentConsumer(rmq, c.ServiceController.Service)

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
		c.ServiceController,
		c.LogController,
		c.PermissionMW,
	)

	routes.WebhookRoutes(r, c.WebhookController)

	routes.ServerRoutes(
		r,
		workspaceRoute,
		c.ServerController,
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
	routes.DashboardRoutes(workspaceRoute, c.DashboardController, c.PermissionMW)

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

	/* ---------------- SERVER ---------------- */

	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
