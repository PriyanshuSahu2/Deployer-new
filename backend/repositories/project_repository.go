package repositories

import (
	"backend/db"
	models_project "backend/models/project"
)

type ProjectRepository struct{}

func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{}
}

func (r *ProjectRepository) Create(project *models_project.Project) error {
	return db.DB.Create(project).Error
}

func (r *ProjectRepository) Update(project *models_project.Project) error {
	return db.DB.Model(&models_project.Project{}).
		Where("id = ?", project.ID).
		Updates(map[string]interface{}{
			"name":        project.Name,
			"description": project.Description,
		}).Error
}

func (r *ProjectRepository) GetByUUID(uuid string) (*models_project.Project, error) {
	var project models_project.Project
	err := db.DB.Where("uuid = ?", uuid).First(&project).Error
	return &project, err
}

func (r *ProjectRepository) ListByWorkspace(workspaceID uint) ([]models_project.Project, error) {
	var projects []models_project.Project
	err := db.DB.
		Where("workspace_id = ? AND is_archived = ?", workspaceID, false).
		Order("created_at DESC").
		Find(&projects).Error

	return projects, err
}

func (r *ProjectRepository) Delete(project *models_project.Project) error {
	return db.DB.Delete(project).Error
}
