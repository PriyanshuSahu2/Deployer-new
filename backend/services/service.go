package services

import (
	dtos_service "backend/dtos/service"
	models_service "backend/models/service"
	"backend/repositories"
	"errors"

	"gorm.io/gorm"
)

type ServiceService struct {
	ServiceRepo     *repositories.ServiceRepository
	ProjectRepo     *repositories.ProjectRepository
	EnvironmentRepo *repositories.EnvironmentRepository
	ServerRepo      *repositories.ServerRepository
}

func NewServiceService(
	serviceRepo *repositories.ServiceRepository,
	projectRepo *repositories.ProjectRepository,
	environmentRepo *repositories.EnvironmentRepository,
	serverRepo *repositories.ServerRepository,
) *ServiceService {
	return &ServiceService{
		ServiceRepo:     serviceRepo,
		ProjectRepo:     projectRepo,
		EnvironmentRepo: environmentRepo,
		ServerRepo:      serverRepo,
	}
}

func (s *ServiceService) CreateService(tx *gorm.DB, userID uint, projectUUID string, dto dtos_service.CreateServiceDTO) (*dtos_service.ServiceCreationResponseDTO, error) {
	project, err := s.ProjectRepo.GetByUUID(tx, projectUUID)
	if err != nil {
		return nil, errors.New("project not found")
	}

	server, err := s.ServerRepo.GetByUUID(dto.ServerUUID)
	if err != nil {
		return nil, errors.New("server not found")
	}

	var envId uint
	if dto.EnvironmentUUID != "" {
		env, err := s.EnvironmentRepo.GetByUUID(tx, dto.EnvironmentUUID)
		if err != nil {
			return nil, errors.New("environment not found")
		}
		envId = env.ID
	} else {
		envs, err := s.EnvironmentRepo.ListByProject(tx, project.ID)
		if err != nil || len(envs) == 0 {
			return nil, errors.New("no default environment found in project")
		}
		envId = envs[0].ID
	}

	service := models_service.Service{
		Name:          dto.Name,
		EnvironmentID: envId,
		Type:          dto.Type,
		Framework:     dto.Framework,
		Description:   dto.Description,
		BuildCommand:  dto.BuildCommand,
		StartCommand:  dto.StartCommand,
		DeployPath:    dto.DeployPath,
		ServerID:      &server.ID,
		ProjectID:     project.ID,
	}

	if err := s.ServiceRepo.CreateService(tx, &service); err != nil {
		return nil, err
	}

	// gitConfig := models_service.ServiceGitConfig{
	// 	ServiceID:     service.ID,
	// 	RepositoryURL: dto.Git.RepositoryURL,
	// 	Branch:        dto.Git.Branch,
	// 	AuthType:      dto.Git.AuthType,
	// }

	return &dtos_service.ServiceCreationResponseDTO{
		ID:            service.ID,
		Name:          service.Name,
		ProjectID:     service.ProjectID,
		EnvironmentID: service.EnvironmentID,
		Type:          service.Type,
		Framework:     service.Framework,
		Description:   service.Description,
		BuildCommand:  service.BuildCommand,
		StartCommand:  service.StartCommand,
		DeployPath:    service.DeployPath,
		CreatedAt:     service.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}
