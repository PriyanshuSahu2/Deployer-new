package repositories

import (
	"backend/db"
	models_environment "backend/models/environment"
	"gorm.io/gorm"
)

type EnvironmentRepository struct{}

func NewEnvironmentRepository() *EnvironmentRepository {
	return &EnvironmentRepository{}
}

func (r *EnvironmentRepository) Create(tx *gorm.DB, env *models_environment.Environment) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Create(env).Error
}

func (r *EnvironmentRepository) ListByProject(tx *gorm.DB, projectID uint) ([]models_environment.Environment, error) {
	var envs []models_environment.Environment
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("project_id = ?", projectID).Find(&envs).Error
	return envs, err
}
