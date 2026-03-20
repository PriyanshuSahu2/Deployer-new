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
	SSHService      SSHService
	GitService      GitService
}

func NewServiceService(
	serviceRepo *repositories.ServiceRepository,
	projectRepo *repositories.ProjectRepository,
	environmentRepo *repositories.EnvironmentRepository,
	serverRepo *repositories.ServerRepository,
	sshService SSHService,
	gitService GitService,
) *ServiceService {
	return &ServiceService{
		ServiceRepo:     serviceRepo,
		ProjectRepo:     projectRepo,
		EnvironmentRepo: environmentRepo,
		ServerRepo:      serverRepo,
		SSHService:      sshService,
		GitService:      gitService,
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
	var envUUID string
	if dto.EnvironmentUUID != "" {
		env, err := s.EnvironmentRepo.GetByUUID(tx, dto.EnvironmentUUID)
		if err != nil {
			return nil, errors.New("environment not found")
		}
		envId = env.ID
		envUUID = env.UUID.String()
	} else {
		envs, err := s.EnvironmentRepo.ListByProject(tx, project.ID)
		if err != nil || len(envs) == 0 {
			return nil, errors.New("no default environment found in project")
		}
		envId = envs[0].ID
		envUUID = envs[0].UUID.String()
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

	gitConfig := models_service.ServiceGitConfig{
		ServiceID:     service.ID,
		Provider:      dto.Git.Provider,
		RepositoryURL: dto.Git.RepositoryURL,
		Branch:        dto.Git.Branch,
		SubDirectory:  dto.Git.SubDirectory,
		AuthType:      dto.Git.AuthType,
	}

	if err := s.ServiceRepo.AddGitConfig(tx, &gitConfig); err != nil {
		return nil, err
	}

	for _, envVar := range dto.EnvVariables {
		env := models_service.ServiceEnvVariable{
			ServiceID:       service.ID,
			Key:             envVar.Key,
			Value:           envVar.Value,
			IsSecret:        envVar.IsSecret,
			IsBuildVariable: envVar.IsBuildVariable,
		}
		if err := s.ServiceRepo.AddEnvVariable(tx, &env); err != nil {
			return nil, err
		}
	}

	return &dtos_service.ServiceCreationResponseDTO{
		UUID:            service.UUID.String(),
		Name:            service.Name,
		ProjectID:       service.ProjectID,
		EnvironmentID:   service.EnvironmentID,
		EnvironmentUUID: envUUID,
		Type:            service.Type,
		Framework:       service.Framework,
		Description:     service.Description,
		BuildCommand:    service.BuildCommand,
		StartCommand:    service.StartCommand,
		DeployPath:      service.DeployPath,
		CreatedAt:       service.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}

func (s *ServiceService) GetServicesByProject(tx *gorm.DB, userID uint, projectUUID string) ([]dtos_service.ServiceCreationResponseDTO, error) {
	project, err := s.ProjectRepo.GetByUUID(tx, projectUUID)
	if err != nil {
		return nil, errors.New("project not found")
	}

	services, err := s.ServiceRepo.GetServicesByProject(tx, project.ID)
	if err != nil {
		return nil, err
	}

	var response []dtos_service.ServiceCreationResponseDTO
	for _, service := range services {
		response = append(response, dtos_service.ServiceCreationResponseDTO{
			UUID:            service.UUID.String(),
			Name:            service.Name,
			ProjectID:       service.ProjectID,
			EnvironmentID:   service.EnvironmentID,
			EnvironmentUUID: service.Environment.UUID.String(),
			Type:            service.Type,
			Framework:       service.Framework,
			Description:     service.Description,
			BuildCommand:    service.BuildCommand,
			StartCommand:    service.StartCommand,
			DeployPath:      service.DeployPath,
			CreatedAt:       service.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}
	return response, nil
}

func (s *ServiceService) GetServiceByUUID(tx *gorm.DB, serviceUUID string) (*models_service.Service, error) {
	return s.ServiceRepo.GetByUUID(tx, serviceUUID)
}
func (s *ServiceService) runDeployment(service *dtos_service.ServiceDetailsResponseDTO, serviceUUID string, workspaceUUID string) {
	sshClient, err := s.SSHService.Connect(
		service.Server.Host,
		service.Server.Port,
		service.Server.Username,
		[]byte(service.Server.PassKey),
	)
	if err != nil {
		return
	}
	defer sshClient.Close()
	_, err = s.GitService.CloneRepo(sshClient, service.Git.RepositoryURL, "", "Github", workspaceUUID)
	result, err := s.GitService.SwitchBranch(sshClient, "Deployer-new", "main")
	println(result)
	result, err = s.GitService.Pull(sshClient, "Deployer-new")
	println(result)

}
func (s *ServiceService) DeployService(tx *gorm.DB, serviceUUID string, workspaceUUID string) error {
	service, err := s.ServiceRepo.GetServiceWithDetails(tx, serviceUUID)
	if err != nil {
		return err
	}
	var gitConfigDTO *dtos_service.GitConfigDTO
	if service.GitConfig != nil {
		gitConfigDTO = &dtos_service.GitConfigDTO{
			Provider:      service.GitConfig.Provider,
			RepositoryURL: service.GitConfig.RepositoryURL,
			Branch:        service.GitConfig.Branch,
			SubDirectory:  service.GitConfig.SubDirectory,
			AuthType:      service.GitConfig.AuthType,
		}
	}

	var envVarsDTO []dtos_service.EnvVariableDTO
	for _, env := range service.EnvVariables {
		envVarsDTO = append(envVarsDTO, dtos_service.EnvVariableDTO{
			Key:             env.Key,
			Value:           env.Value,
			IsSecret:        env.IsSecret,
			IsBuildVariable: env.IsBuildVariable,
		})
	}

	var serverConfigDTO *dtos_service.ServerConfigDTO
	if service.Server != nil {
		serverConfigDTO = &dtos_service.ServerConfigDTO{
			ServerID: service.ServerID,
			Name:     service.Server.Name,
			Host:     service.Server.Host,
			Port:     service.Server.Port,
			Username: service.Server.Username,
			PassKey:  service.Server.PassKey,
			AuthType: service.Server.AuthType,
		}
	}

	serviceDetails := dtos_service.ServiceDetailsResponseDTO{
		ServiceCreationResponseDTO: dtos_service.ServiceCreationResponseDTO{
			UUID:            service.UUID.String(),
			Name:            service.Name,
			ProjectID:       service.ProjectID,
			EnvironmentID:   service.EnvironmentID,
			EnvironmentUUID: service.Environment.UUID.String(),
			Type:            service.Type,
			Framework:       service.Framework,
			Description:     service.Description,
			BuildCommand:    service.BuildCommand,
			StartCommand:    service.StartCommand,
			DeployPath:      service.DeployPath,
			CreatedAt:       service.CreatedAt.Format("2006-01-02 15:04:05"),
		},
		Git:          gitConfigDTO,
		EnvVariables: envVarsDTO,
		Server:       serverConfigDTO,
	}
	go s.runDeployment(&serviceDetails, serviceUUID, workspaceUUID)

	return nil
}
