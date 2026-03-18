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
			"name":      server.Name,
			"host":      server.Host,
			"port":      server.Port,
			"username":  server.Username,
			"auth_type": server.AuthType,
			"pass_key":  server.PassKey,
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
