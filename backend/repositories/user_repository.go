package repositories

import (
	"backend/db"
	models_auth "backend/models/auth"

	"github.com/google/uuid"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) GetByUUIDOrEmail(uuid *uuid.UUID, email string) (*models_auth.User, error) {
	var user models_auth.User
	err := db.DB.Where("uuid = ? OR email = ?", uuid, email).First(&user).Error
	return &user, err
}

func (r *UserRepository) GetByID(id uint) (*models_auth.User, error) {
	var user models_auth.User
	err := db.DB.Where("id = ?", id).First(&user).Error
	return &user, err
}
