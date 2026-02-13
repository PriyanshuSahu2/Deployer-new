package db

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDB() {
	if err := godotenv.Load(); err != nil {
		panic("Error loading .env file")
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		panic("DB_DSN not found in environment")
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("failed to connect database: %v", err))
	}

	fmt.Println("✅ Database connected successfully")
}
