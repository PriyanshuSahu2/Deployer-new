package main

import (
	"log"
	"os"

	"backend/db"
	"backend/rabbitmq"
	"backend/services"
	"backend/worker"

	"github.com/joho/godotenv"
)

func init() {
	_ = godotenv.Load()
}

func main() {
	log.Println("🚀 Starting Email Worker...")

	db.ConnectToDB()

	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://guest:guest@localhost:5672/"
	}

	rmq, err := rabbitmq.NewRabbitMQ(rabbitURL)
	if err != nil {
		log.Fatal(err)
	}
	defer rmq.Close()

	rmq.DeclareTopology()

	emailService := services.NewEmailService(nil)

	err = worker.StartEmailConsumer(rmq, emailService)
	if err != nil {
		log.Fatal(err)
	}
}
