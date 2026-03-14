package repositories

import (
	models_integration "backend/models/integrations"
	"gorm.io/gorm"
)

type IntegrationRepository struct {
}

func NewIntegrationRepository() *IntegrationRepository {
	return &IntegrationRepository{}
}

func (r *IntegrationRepository) CreateOrUpdate(tx *gorm.DB, integration *models_integration.WorkspaceGitIntegration) error {
	var existing models_integration.WorkspaceGitIntegration
	
	err := tx.Where("workspace_id = ? AND provider = ?", integration.WorkspaceID, integration.Provider).First(&existing).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return tx.Create(integration).Error
		}
		return err
	}

	// Update existing record
	integration.ID = existing.ID
	return tx.Save(integration).Error
}

func (r *IntegrationRepository) GetWorkSpaceIntegrations(tx *gorm.DB, workspaceId uint) ([]models_integration.WorkspaceGitIntegration, error) {
	var integrations []models_integration.WorkspaceGitIntegration
	err := tx.Where("workspace_id = ?", workspaceId).Find(&integrations).Error
	return integrations, err
}

func (r *IntegrationRepository) GetIntegrationByProvider(tx *gorm.DB, workspaceId uint, provider string) (*models_integration.WorkspaceGitIntegration, error) {
	var integration models_integration.WorkspaceGitIntegration
	err := tx.Where("workspace_id = ? AND provider = ?", workspaceId, provider).First(&integration).Error
	return &integration, err
}


func (r *IntegrationRepository) DeleteIntegration(tx *gorm.DB, workspaceId uint, provider string) error {
	return tx.Where("workspace_id = ? AND provider = ?", workspaceId, provider).Delete(&models_integration.WorkspaceGitIntegration{}).Error
}
