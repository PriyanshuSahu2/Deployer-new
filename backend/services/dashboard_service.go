package services

import (
	dtos_dashboard "backend/dtos/dashboard"
	dtos_service "backend/dtos/service"
	"backend/repositories"
	"errors"

	"gorm.io/gorm"
)

type DashboardService struct {
	WorkspaceRepo    *repositories.WorkspaceRepository
	ProjectRepo      *repositories.ProjectRepository
	ServiceRepo      *repositories.ServiceRepository
	ServerRepo       *repositories.ServerRepository
	DeploymentRepo   *repositories.DeploymentRepository
}

func NewDashboardService(
	workspaceRepo *repositories.WorkspaceRepository,
	projectRepo *repositories.ProjectRepository,
	serviceRepo *repositories.ServiceRepository,
	serverRepo *repositories.ServerRepository,
	deploymentRepo *repositories.DeploymentRepository,
) *DashboardService {
	return &DashboardService{
		WorkspaceRepo:    workspaceRepo,
		ProjectRepo:      projectRepo,
		ServiceRepo:      serviceRepo,
		ServerRepo:       serverRepo,
		DeploymentRepo:   deploymentRepo,
	}
}

func (s *DashboardService) GetDashboardStats(tx *gorm.DB, workspaceUUID string) (*dtos_dashboard.DashboardStatsDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	totalProjects, _ := s.ProjectRepo.CountByWorkspace(tx, workspace.ID)
	totalServices, _ := s.ProjectRepo.CountServicesByWorkspace(tx, workspace.ID)
	totalServers, _ := s.ServerRepo.CountByWorkspace(tx, workspace.ID)
	totalDeployments, _ := s.DeploymentRepo.GetTotalDeploymentsByWorkspace(tx, workspace.ID)

	recentDeployments, _ := s.DeploymentRepo.GetRecentDeploymentsByWorkspace(tx, workspace.ID, 10)

	var recentDTOs []dtos_service.DeploymentResponseDTO
	for _, d := range recentDeployments {
		recentDTOs = append(recentDTOs, dtos_service.DeploymentResponseDTO{
			UUID:        d.UUID.String(),
			ServiceID:   d.ServiceID,
			ServiceName: d.Service.Name,
			Status:      d.Status,
			StartTime:   d.StartTime,
			EndTime:     d.EndTime,
		})
	}

	return &dtos_dashboard.DashboardStatsDTO{
		TotalProjects:     totalProjects,
		TotalServices:     totalServices,
		TotalServers:      totalServers,
		TotalDeployments:  totalDeployments,
		RecentDeployments: recentDTOs,
	}, nil
}

func (s *DashboardService) GetDeploymentLogs(tx *gorm.DB, workspaceUUID string, deploymentUUID string) (string, error) {
	_, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return "", errors.New("workspace not found")
	}

	deployment, err := s.DeploymentRepo.GetByUUID(tx, deploymentUUID)
	if err != nil {
		return "", errors.New("deployment not found")
	}

	return deployment.Logs, nil
}

func (s *DashboardService) GetWorkspaceDeployments(tx *gorm.DB, workspaceUUID string) ([]dtos_service.DeploymentResponseDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	deployments, err := s.DeploymentRepo.GetAllDeploymentsByWorkspace(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	var dtos []dtos_service.DeploymentResponseDTO
	for _, d := range deployments {
		dtos = append(dtos, dtos_service.DeploymentResponseDTO{
			UUID:        d.UUID.String(),
			ServiceID:   d.ServiceID,
			ServiceName: d.Service.Name,
			Status:      d.Status,
			StartTime:   d.StartTime,
			EndTime:     d.EndTime,
			Logs:        d.Logs,
		})
	}

	return dtos, nil
}
