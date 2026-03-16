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
		Name:           dto.Name,
		Description:    dto.Description,
		WorkspaceID:    workspace.ID,
		ServiceType:    dto.ServiceType,
		Framework:      dto.Framework,
		BuildCommand:   dto.BuildCommand,
		StartCommand:   dto.StartCommand,
		AppPort:        dto.AppPort,
		GitProvider:    dto.GitProvider,
		Repository:     dto.Repository,
		Branch:         dto.Branch,
		Provider:       dto.Provider,
		Region:         dto.Region,
		InstanceType:   dto.InstanceType,
		Strategy:       dto.Strategy,
		MetricsEnabled: dto.MetricsEnabled,
	}

	return s.ServerRepo.Create(&server)
}

func (s *ServerService) UpdateServer(userID uint, dto dtos_server.UpdateServerDTO) error {
	server, err := s.ServerRepo.GetByUUID(dto.UUID)
	if err != nil {
		return errors.New("server not found")
	}

	server.Name = dto.Name
	server.Description = dto.Description
	server.ServiceType = dto.ServiceType
	server.Framework = dto.Framework
	server.BuildCommand = dto.BuildCommand
	server.StartCommand = dto.StartCommand
	server.AppPort = dto.AppPort
	server.GitProvider = dto.GitProvider
	server.Repository = dto.Repository
	server.Branch = dto.Branch
	server.Provider = dto.Provider
	server.Region = dto.Region
	server.InstanceType = dto.InstanceType
	server.Strategy = dto.Strategy
	server.MetricsEnabled = dto.MetricsEnabled

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
			UUID:           srv.UUID.String(),
			Name:           srv.Name,
			Description:    srv.Description,
			WorkspaceID:    srv.WorkspaceID,
			ServiceType:    srv.ServiceType,
			Framework:      srv.Framework,
			BuildCommand:   srv.BuildCommand,
			StartCommand:   srv.StartCommand,
			AppPort:        srv.AppPort,
			GitProvider:    srv.GitProvider,
			Repository:     srv.Repository,
			Branch:         srv.Branch,
			Provider:       srv.Provider,
			Region:         srv.Region,
			InstanceType:   srv.InstanceType,
			Strategy:       srv.Strategy,
			MetricsEnabled: srv.MetricsEnabled,
			CreatedAt:      srv.CreatedAt.Format("2006-01-02 15:04:05"),
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
