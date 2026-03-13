package repositories

import (
	"backend/db"
	models_auth "backend/models/auth"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) GetByUUIDOrEmail(tx *gorm.DB, uuid *uuid.UUID, email string) (*models_auth.User, error) {
	var user models_auth.User
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("uuid = ? OR email = ?", uuid, email).First(&user).Error
	return &user, err
}

func (r *UserRepository) GetByID(tx *gorm.DB, id uint) (*models_auth.User, error) {
	var user models_auth.User
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("id = ?", id).First(&user).Error
	return &user, err
}
