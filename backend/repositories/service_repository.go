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

func (r *ServiceRepository) UpdateService(tx *gorm.DB, service *models_service.Service) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	// We only update the provided fields, and since we might update ID/UUID we only use an existing model or dict.
	// Since service contains the ID, we can do Save() or Updates()
	return query.Save(service).Error
}

func (r *ServiceRepository) DeleteGitConfigByServiceID(tx *gorm.DB, serviceID uint) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Unscoped().Where("service_id = ?", serviceID).Delete(&models_service.ServiceGitConfig{}).Error
}

func (r *ServiceRepository) DeleteEnvVariablesByServiceID(tx *gorm.DB, serviceID uint) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Unscoped().Where("service_id = ?", serviceID).Delete(&models_service.ServiceEnvVariable{}).Error
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

func (r *ServiceRepository) CountByWorkspaceAndStatuses(tx *gorm.DB, workspaceID uint, statuses []string) (int64, error) {
	var count int64
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Model(&models_service.Service{}).
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ? AND services.status IN ?", workspaceID, statuses).
		Count(&count).Error

	return count, err
}

func (r *ServiceRepository) GetServicesByWorkspaceAndStatus(tx *gorm.DB, workspaceID uint, status string, limit int) ([]models_service.Service, error) {
	var services []models_service.Service
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Project").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ? AND services.status = ?", workspaceID, status).
		Order("services.updated_at DESC").
		Limit(limit).
		Find(&services).Error

	return services, err
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

func (r *ServiceRepository) GetServicesByRepoAndBranch(tx *gorm.DB, full_name string, branch string) ([]models_service.ServiceGitConfig, error) {
	var gitConfigs []models_service.ServiceGitConfig
	query := db.DB

	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Service").
		Preload("Service.Project").
		Preload("Service.Project.Workspace").
		Where("repository_url = ? AND branch = ? AND auto_deploy = ?", full_name, branch, true).
		Find(&gitConfigs).Error

	return gitConfigs, err
}

func (r *ServiceRepository) ToggleAutoDeploy(tx *gorm.DB, serviceUUID string, enabled bool) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	var service models_service.Service
	if err := query.Select("id").Where("uuid = ?", serviceUUID).First(&service).Error; err != nil {
		return err
	}
	return query.Model(&models_service.ServiceGitConfig{}).
		Where("service_id = ?", service.ID).
		Update("auto_deploy", enabled).Error
}
