package services

import (
	"errors"

	dtos_server "backend/dtos/server"
	models_server "backend/models/server"
	"backend/repositories"
)

type ServerService struct {
	ServerRepo    *repositories.ServerRepository
	WorkspaceRepo *repositories.WorkspaceRepository
}

func NewServerService(
	serverRepo *repositories.ServerRepository,
	workspaceRepo *repositories.WorkspaceRepository,
) *ServerService {
	return &ServerService{
		ServerRepo:    serverRepo,
		WorkspaceRepo: workspaceRepo,
	}
}

func (s *ServerService) CreateServer(userID uint, workspaceUUID string, dto dtos_server.CreateServerDTO) error {
	workspace, err := s.WorkspaceRepo.GetByUUID(nil, workspaceUUID)
	if err != nil {
		return errors.New("workspace not found")
	}

	server := models_server.Server{
		Name:        dto.Name,
		WorkspaceID: workspace.ID,
		Host:        dto.Host,
		Port:        dto.Port,
		Username:    dto.Username,
		AuthType:    dto.AuthType,
		PassKey:     dto.PassKey,
		CreatedByID: userID,
	}

	return s.ServerRepo.Create(&server)
}

func (s *ServerService) UpdateServer(userID uint, dto dtos_server.UpdateServerDTO) error {
	server, err := s.ServerRepo.GetByUUID(dto.UUID)
	if err != nil {
		return errors.New("server not found")
	}

	server.Name = dto.Name
	server.Host = dto.Host
	server.Port = dto.Port
	server.Username = dto.Username
	server.AuthType = dto.AuthType
	server.PassKey = dto.PassKey

	return s.ServerRepo.Update(server)
}

func (s *ServerService) ListServers(userID uint, workspaceUUID string) ([]dtos_server.ServerResponseDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(nil, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	servers, err := s.ServerRepo.ListByWorkspace(workspace.ID)
	if err != nil {
		return nil, err
	}

	response := make([]dtos_server.ServerResponseDTO, len(servers))
	for i, srv := range servers {
		response[i] = dtos_server.ServerResponseDTO{
			UUID:        srv.UUID.String(),
			WorkspaceID: srv.WorkspaceID,
			Name:        srv.Name,
			Host:        srv.Host,
			Port:        srv.Port,
			Username:    srv.Username,
			AuthType:    srv.AuthType,
			PassKey:     srv.PassKey,
			CreatedByID: srv.CreatedByID,
			CreatedAt:   srv.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	return response, nil
}

func (s *ServerService) DeleteServer(userID uint, serverUUID string) error {
	server, err := s.ServerRepo.GetByUUID(serverUUID)
	if err != nil {
		return errors.New("server not found")
	}

	return s.ServerRepo.Delete(server)
}
