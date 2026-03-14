package services

import "backend/repositories"

type RedisService struct {
	RedisRepo *repositories.RedisRepository
}
