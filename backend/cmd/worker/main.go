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
	defer rmq.Close()

	rmq.DeclareTopology()

	emailService := services.NewEmailService(nil)

	err = worker.StartEmailConsumer(rmq, emailService)
	if err != nil {
		log.Fatal(err)
	}
}
