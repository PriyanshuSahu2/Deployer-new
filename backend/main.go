package main

import (
	models_auth "backend/models/auth"
	"backend/routes"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "backend/docs" // swagger docs

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func init(){
	godotenv.Load()
}

func main() {
	// Connect to SQLite
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("failed to connect database: %v", err))
	}

	db.AutoMigrate(&models_auth.User{})
	r := gin.Default()

	// Pass db to routes
	routes.AuthRoutes(r, db)

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Run server
	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
