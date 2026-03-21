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

func (r *ServiceRepository) GetServicesByProject(tx *gorm.DB, projectID uint) ([]models_service.Service, error) {
	var services []models_service.Service
	query := db.DB

	if tx != nil {
		query = tx
	}

	err := query.Preload("Environment").Where("project_id = ?", projectID).Find(&services).Error
	return services, err
}

func (r *ServiceRepository) GetByUUID(tx *gorm.DB, serviceUUID string) (*models_service.Service, error) {
	var service models_service.Service
	query := db.DB

	if tx != nil {
		query = tx
	}

	err := query.Preload("Environment").Where("uuid = ?", serviceUUID).First(&service).Error
	return &service, err
}

func (r *ServiceRepository) GetServiceWithDetails(tx *gorm.DB, serviceUUID string) (*models_service.Service, error) {
	var service models_service.Service
	query := db.DB

	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Environment").
		Preload("GitConfig").
		Preload("EnvVariables").
		Preload("Project").
		Preload("Server").
		Where("uuid = ?", serviceUUID).
		First(&service).Error

	return &service, err
}
