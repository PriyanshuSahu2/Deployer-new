package repositories

import (
	"backend/db"
	models_server "backend/models/server"
)

type ServerRepository struct{}

func NewServerRepository() *ServerRepository {
	return &ServerRepository{}
}

func (r *ServerRepository) Create(server *models_server.Server) error {
	return db.DB.Create(server).Error
}

func (r *ServerRepository) Update(server *models_server.Server) error {
	return db.DB.Model(&models_server.Server{}).
		Where("id = ?", server.ID).
		Updates(map[string]interface{}{
			"name":            server.Name,
			"description":     server.Description,
			"service_type":    server.ServiceType,
			"framework":       server.Framework,
			"build_command":   server.BuildCommand,
			"start_command":   server.StartCommand,
			"app_port":        server.AppPort,
			"git_provider":    server.GitProvider,
			"repository":      server.Repository,
			"branch":          server.Branch,
			"provider":        server.Provider,
			"region":          server.Region,
			"instance_type":   server.InstanceType,
			"strategy":        server.Strategy,
			"metrics_enabled": server.MetricsEnabled,
		}).Error
}

func (r *ServerRepository) GetByUUID(uuid string) (*models_server.Server, error) {
	var server models_server.Server
	err := db.DB.Where("uuid = ?", uuid).First(&server).Error
	return &server, err
}

func (r *ServerRepository) ListByWorkspace(workspaceID uint) ([]models_server.Server, error) {
	var servers []models_server.Server
	err := db.DB.
		Where("workspace_id = ?", workspaceID).
		Order("created_at DESC").
		Find(&servers).Error
	return servers, err
}

func (r *ServerRepository) Delete(server *models_server.Server) error {
	return db.DB.Delete(server).Error
}
