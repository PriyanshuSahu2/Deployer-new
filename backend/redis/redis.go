package redisclient

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

var (
	Ctx    = context.Background()
	Client *redis.Client
)

func ConnectRedis() {
	Client = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	_, err := Client.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Redis connection failed: %v", err)
	}

	log.Println("Redis connected successfully")
}
