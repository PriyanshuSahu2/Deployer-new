package main

import (
	"backend/db"
	models_auth "backend/models/auth"
	models_oauth "backend/models/oauth"
	"backend/routes"
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
		AllowOrigins:     []string{"http://localhost:5173"}, // frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	db.ConnectToDB()
	db.DB.AutoMigrate(&models_auth.User{}, &models_oauth.OAuthToken{}, &models_auth.OTP{})

	routes.AuthRoutes(r)

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Run server
	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
