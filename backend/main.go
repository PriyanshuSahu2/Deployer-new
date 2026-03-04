package main

import (
	"backend/db"
	models_auth "backend/models/auth"
	models_oauth "backend/models/oauth"
	models_permission "backend/models/permission"
	models_role "backend/models/role"
	models_role_permission "backend/models/role_permission"
	models_workspace "backend/models/workspace"
	"backend/rabbitmq"
	"backend/routes"
	"backend/services"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	_ "backend/docs" // swagger docs

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
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"}, // Next.js frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	db.ConnectToDB()

	rabbitURL := os.Getenv("RABBITMQ_URL")

	rmq, err := rabbitmq.NewRabbitMQ(rabbitURL)

	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ:", err)
	}
	err = rmq.DeclareTopology()
	if err != nil {
		log.Fatal("Failed to declare topology:", err)
	}
	emailService := services.NewEmailService(rmq)

	defer rmq.Close()
	db.DB.AutoMigrate(&models_auth.User{}, &models_oauth.OAuthToken{}, &models_auth.OTP{}, &models_workspace.Workspace{}, &models_workspace.WorkspaceMember{},
		&models_permission.Permission{}, &models_role.Role{}, &models_workspace.WorkspaceInvite{}, &models_role_permission.RolePermission{},
	)

	routes.AuthRoutes(r, emailService)
	routes.WorkspaceRoutes(r, emailService)
	routes.RoleRoutes(r, emailService)
	routes.InviteRoutes(r, emailService)
	routes.MemberRoutes(r, emailService)

	// routes.ProjectRoute(r)
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

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Run server
	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
