package repositories

import (
	"backend/db"
	models_project "backend/models/project"
	models_service "backend/models/service"
	"gorm.io/gorm"
)

type ProjectRepository struct{}

func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{}
}

func (r *ProjectRepository) Create(tx *gorm.DB, project *models_project.Project) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Create(project).Error
}

func (r *ProjectRepository) Update(tx *gorm.DB, project *models_project.Project) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Model(&models_project.Project{}).
		Where("id = ?", project.ID).
		Updates(map[string]interface{}{
			"name":        project.Name,
			"description": project.Description,
		}).Error
}

func (r *ProjectRepository) GetByUUID(tx *gorm.DB, uuid string) (*models_project.Project, error) {
	var project models_project.Project
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("uuid = ?", uuid).First(&project).Error
	return &project, err
}

func (r *ProjectRepository) ListByWorkspace(tx *gorm.DB, workspaceID uint) ([]models_project.Project, error) {
	var projects []models_project.Project
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.
		Where("workspace_id = ? AND is_archived = ?", workspaceID, false).
		Order("created_at DESC").
		Find(&projects).Error

	return projects, err
}

func (r *ProjectRepository) Delete(tx *gorm.DB, project *models_project.Project) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Delete(project).Error
}

func (r *ProjectRepository) CountByWorkspace(tx *gorm.DB, workspaceID uint) (int64, error) {
	var count int64
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Model(&models_project.Project{}).Where("workspace_id = ?", workspaceID).Count(&count).Error
	return count, err
}

func (r *ProjectRepository) CountServicesByWorkspace(tx *gorm.DB, workspaceID uint) (int64, error) {
	var count int64
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Model(&models_service.Service{}).
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ?", workspaceID).
		Count(&count).Error
	return count, err
}
