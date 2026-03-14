package repositories

import (
	"backend/db"
	models_service "backend/models/service"

	"gorm.io/gorm"
)

type ServiceRepository struct{}

func NewServiceRepository() *ServiceRepository {
	return &ServiceRepository{}
}

func (r *ServiceRepository) CreateService(tx *gorm.DB, service *models_service.Service) error {
	query := db.DB

	if tx != nil {
		query = tx
	}

	return query.Create(&service).Error
}

func (r *ServiceRepository) AddGitConfig(tx *gorm.DB, config *models_service.ServiceGitConfig) error {
	query := db.DB

	if tx != nil {
		query = tx
	}

	return query.Create(&config).Error
}

func (r *ServiceRepository) AddEnvVariable(tx *gorm.DB, env_variable *models_service.ServiceEnvVariable) error {
	query := db.DB

	if tx != nil {
		query = tx
	}

	return query.Create(&env_variable).Error
}
