package services

import (
	dtos_environment "backend/dtos/environment"
	dtos_project "backend/dtos/project"
	dtos_service "backend/dtos/service"
	models_service "backend/models/service"
	"backend/repositories"
	"errors"
	"fmt"
	"os"
	"strings"

	"gorm.io/gorm"
)

type ServiceService struct {
	ServiceRepo        *repositories.ServiceRepository
	ProjectRepo        *repositories.ProjectRepository
	EnvironmentRepo    *repositories.EnvironmentRepository
	ServerRepo         *repositories.ServerRepository
	DeploymentService  DeploymentService
	IntegrationService *IntegrationService
}

func NewServiceService(
	serviceRepo *repositories.ServiceRepository,
	projectRepo *repositories.ProjectRepository,
	environmentRepo *repositories.EnvironmentRepository,
	serverRepo *repositories.ServerRepository,
	deploymentService DeploymentService,
	integrationService *IntegrationService,
) *ServiceService {
	return &ServiceService{
		ServiceRepo:        serviceRepo,
		ProjectRepo:        projectRepo,
		EnvironmentRepo:    environmentRepo,
		ServerRepo:         serverRepo,
		DeploymentService:  deploymentService,
		IntegrationService: integrationService,
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
		StartCommand:    dto.StartCommand,
		DeployPath:      dto.DeployPath,
		OutputDirectory: dto.OutputDirectory,
		Domain:          dto.Domain,
		HttpsEnabled:  dto.HttpsEnabled,
		CertType:      dto.CertType,
		CustomCert:    dto.CustomCert,
		CustomKey:     dto.CustomKey,
		Port:          dto.Port,
		DockerizeType: dto.DockerizeType,
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
		Branch:         dto.Git.Branch,
		SubDirectory:   dto.Git.SubDirectory,
		AuthType:       dto.Git.AuthType,
		AutoDeploy:     dto.Git.AutoDeploy,
		WebhookEnabled: dto.Git.WebhookEnabled,
	}

	if err := s.ServiceRepo.AddGitConfig(tx, &gitConfig); err != nil {
		return nil, err
	}

	// Auto-register GitHub webhook if AutoDeploy is enabled
	if dto.Git.AutoDeploy && strings.EqualFold(dto.Git.Provider, "github") {
		workspaceUUID := dto.ProjectUUID // use projectUUID to look up workspace in the goroutine
		go s.IntegrationService.RegisterGitHubWebhookForProject(workspaceUUID, project.WorkspaceID, dto.Git.RepositoryURL)
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
		OutputDirectory: service.OutputDirectory,
		Domain:          service.Domain,
		HttpsEnabled:    service.HttpsEnabled,
		CertType:        service.CertType,
		CustomCert:      service.CustomCert,
		CustomKey:       service.CustomKey,
		Port:            service.Port,
		DockerizeType:   service.DockerizeType,
		CreatedAt:       service.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}

func (s *ServiceService) UpdateService(tx *gorm.DB, userID uint, projectUUID string, serviceUUID string, dto dtos_service.UpdateServiceDTO) (*dtos_service.ServiceCreationResponseDTO, error) {
	project, err := s.ProjectRepo.GetByUUID(tx, projectUUID)
	if err != nil {
		return nil, errors.New("project not found")
	}

	service, err := s.ServiceRepo.GetByUUID(tx, serviceUUID)
	if err != nil {
		return nil, errors.New("service not found")
	}

	if service.ProjectID != project.ID {
		return nil, errors.New("service does not belong to this project")
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
		envId = service.EnvironmentID
		// we fetch to get envUUID
		// for simplicity we might just skip the response env uuid accurately if not provided, but usually we just keep it.
	}

	// Update basic fields
	service.Name = dto.Name
	service.EnvironmentID = envId
	service.Type = dto.Type
	service.Framework = dto.Framework
	service.Description = dto.Description
	service.BuildCommand = dto.BuildCommand
	service.StartCommand = dto.StartCommand
	service.DeployPath = dto.DeployPath
	service.OutputDirectory = dto.OutputDirectory
	service.Domain = dto.Domain
	service.HttpsEnabled = dto.HttpsEnabled
	service.CertType = dto.CertType
	service.CustomCert = dto.CustomCert
	service.CustomKey = dto.CustomKey
	service.Port = dto.Port
	service.DockerizeType = dto.DockerizeType
	service.ServerID = &server.ID

	if err := s.ServiceRepo.UpdateService(tx, service); err != nil {
		return nil, err
	}

	// Update GitConfig: delete old, create new
	if err := s.ServiceRepo.DeleteGitConfigByServiceID(tx, service.ID); err != nil {
		return nil, err
	}

	gitConfig := models_service.ServiceGitConfig{
		ServiceID:      service.ID,
		Provider:       dto.Git.Provider,
		RepositoryURL:  dto.Git.RepositoryURL,
		Branch:         dto.Git.Branch,
		SubDirectory:   dto.Git.SubDirectory,
		AuthType:       dto.Git.AuthType,
		AutoDeploy:     dto.Git.AutoDeploy,
		WebhookEnabled: dto.Git.WebhookEnabled,
	}

	if err := s.ServiceRepo.AddGitConfig(tx, &gitConfig); err != nil {
		return nil, err
	}

	if dto.Git.AutoDeploy && strings.EqualFold(dto.Git.Provider, "github") {
		workspaceUUID := dto.ProjectUUID
		go s.IntegrationService.RegisterGitHubWebhookForProject(workspaceUUID, project.WorkspaceID, dto.Git.RepositoryURL)
	}

	// Update Env Variables: delete old, create new
	if err := s.ServiceRepo.DeleteEnvVariablesByServiceID(tx, service.ID); err != nil {
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
		OutputDirectory: service.OutputDirectory,
		Domain:          service.Domain,
		HttpsEnabled:    service.HttpsEnabled,
		CertType:        service.CertType,
		CustomCert:      service.CustomCert,
		CustomKey:       service.CustomKey,
		Port:            service.Port,
		DockerizeType:   service.DockerizeType,
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
			OutputDirectory: service.OutputDirectory,
			Domain:          service.Domain,
			HttpsEnabled:    service.HttpsEnabled,
			CertType:        service.CertType,
			CustomCert:      service.CustomCert,
			CustomKey:       service.CustomKey,
			Port:            service.Port,
			DockerizeType:   service.DockerizeType,
			CreatedAt:       service.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}
	return response, nil
}

func (s *ServiceService) GetServiceByUUID(tx *gorm.DB, serviceUUID string) (*models_service.Service, error) {
	return s.ServiceRepo.GetByUUID(tx, serviceUUID)
}

func (s *ServiceService) GetServiceDetails(tx *gorm.DB, serviceUUID string) (*dtos_service.ServiceDetailsResponseDTO, error) {
	service, err := s.ServiceRepo.GetServiceWithDetails(tx, serviceUUID)
	if err != nil {
		return nil, err
	}

	var gitConfigDTO *dtos_service.GitConfigDTO
	if service.GitConfig != nil {
		gitConfigDTO = &dtos_service.GitConfigDTO{
			Provider:       service.GitConfig.Provider,
			RepositoryURL:  service.GitConfig.RepositoryURL,
			Branch:         service.GitConfig.Branch,
			SubDirectory:   service.GitConfig.SubDirectory,
			AuthType:       service.GitConfig.AuthType,
			AutoDeploy:     service.GitConfig.AutoDeploy,
			WebhookEnabled: service.GitConfig.WebhookEnabled,
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

	details := &dtos_service.ServiceDetailsResponseDTO{
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
			OutputDirectory: service.OutputDirectory,
			Domain:          service.Domain,
			HttpsEnabled:    service.HttpsEnabled,
			CertType:        service.CertType,
			CustomCert:      service.CustomCert,
			CustomKey:       service.CustomKey,
			Port:            service.Port,
			DockerizeType:   service.DockerizeType,
			CreatedAt:       service.CreatedAt.Format("2006-01-02 15:04:05"),
		},
		Git:          gitConfigDTO,
		EnvVariables: envVarsDTO,
		Server:       serverConfigDTO,
		Project: &dtos_project.ProjectResponseDTO{
			UUID:        service.Project.UUID.String(),
			Name:        service.Project.Name,
			Description: service.Project.Description,
			WorkspaceID: service.Project.WorkspaceID,
		},
		Environment: &dtos_environment.ResponseEnvironmentDTO{
			UUID: service.Environment.UUID.String(),
			Name: service.Environment.Name,
		},
	}

	return details, nil
}

func (s *ServiceService) TriggerDeployment(tx *gorm.DB, serviceUUID string, workspaceUUID string) error {
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
			SubDirectory:   service.GitConfig.SubDirectory,
			AuthType:       service.GitConfig.AuthType,
			AutoDeploy:     service.GitConfig.AutoDeploy,
			WebhookEnabled: service.GitConfig.WebhookEnabled,
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
	var projectDTO *dtos_project.ProjectResponseDTO

	projectDTO = &dtos_project.ProjectResponseDTO{
		UUID:        service.Project.UUID.String(),
		Name:        service.Project.Name,
		Description: service.Project.Description,
		WorkspaceID: service.Project.WorkspaceID,
	}

	var environmentDTO *dtos_environment.ResponseEnvironmentDTO

	environmentDTO = &dtos_environment.ResponseEnvironmentDTO{
		UUID: service.Environment.UUID.String(),
		Name: service.Environment.Name,
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
			OutputDirectory: service.OutputDirectory,
			Domain:          service.Domain,
			HttpsEnabled:    service.HttpsEnabled,
			CertType:        service.CertType,
			CustomCert:      service.CustomCert,
			CustomKey:       service.CustomKey,
			Port:            service.Port,
			DockerizeType:   service.DockerizeType,
			CreatedAt:       service.CreatedAt.Format("2006-01-02 15:04:05"),
		},
		Git:          gitConfigDTO,
		EnvVariables: envVarsDTO,
		Server:       serverConfigDTO,
		Project:      projectDTO,
		Environment:  environmentDTO,
	}
	go s.DeploymentService.RunDeployment(&serviceDetails, serviceUUID, workspaceUUID)

	return nil
}

func (s *ServiceService) GetServiceLogs(serviceUUID string) (string, error) {
	logFilePath := fmt.Sprintf("logs/deployments/%s.log", serviceUUID)
	data, err := os.ReadFile(logFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", nil // No logs yet
		}
		return "", err
	}
	return string(data), nil
}

func (s *ServiceService) ToggleAutoDeploy(tx *gorm.DB, serviceUUID string, enabled bool) error {
	if err := s.ServiceRepo.ToggleAutoDeploy(tx, serviceUUID, enabled); err != nil {
		return err
	}

	// If enabling, ensure the GitHub webhook is registered
	if enabled && s.IntegrationService != nil {
		service, err := s.ServiceRepo.GetServiceWithDetails(tx, serviceUUID)
		if err == nil && service.GitConfig != nil && strings.EqualFold(service.GitConfig.Provider, "github") {
			go s.IntegrationService.RegisterGitHubWebhookForProject(
				"", service.Project.WorkspaceID, service.GitConfig.RepositoryURL,
			)
		}
	}

	return nil
}

func (s *ServiceService) ProcessGitHubWebhook(full_name string, branch string) {
	fmt.Printf("Processing GitHub webhook for urls %v branch %s\n", full_name, branch)

	gitConfigs, err := s.ServiceRepo.GetServicesByRepoAndBranch(nil, full_name, branch)
	if err != nil {
		fmt.Printf("Error finding services for webhook: %v\n", err)
		return
	}

	for _, config := range gitConfigs {
		if config.Service.UUID.String() != "" {
			fmt.Printf("Auto-deploying service: %s\n", config.Service.Name)
			workspaceUUID := config.Service.Project.Workspace.UUID.String()
			err = s.TriggerDeployment(nil, config.Service.UUID.String(), workspaceUUID)
			if err != nil {
				fmt.Printf("Auto-deploy failed for %s: %v\n", config.Service.Name, err)
			}
		}
	}
}
