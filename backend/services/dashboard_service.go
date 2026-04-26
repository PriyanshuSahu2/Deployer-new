package services

import (
	dtos_dashboard "backend/dtos/dashboard"
	dtos_service "backend/dtos/service"
	"backend/repositories"
	"errors"
	"fmt"
	"math"
	"time"

	"gorm.io/gorm"
)

type DashboardService struct {
	WorkspaceRepo  *repositories.WorkspaceRepository
	ProjectRepo    *repositories.ProjectRepository
	ServiceRepo    *repositories.ServiceRepository
	ServerRepo     *repositories.ServerRepository
	DeploymentRepo *repositories.DeploymentRepository
}

func NewDashboardService(
	workspaceRepo *repositories.WorkspaceRepository,
	projectRepo *repositories.ProjectRepository,
	serviceRepo *repositories.ServiceRepository,
	serverRepo *repositories.ServerRepository,
	deploymentRepo *repositories.DeploymentRepository,
) *DashboardService {
	return &DashboardService{
		WorkspaceRepo:  workspaceRepo,
		ProjectRepo:    projectRepo,
		ServiceRepo:    serviceRepo,
		ServerRepo:     serverRepo,
		DeploymentRepo: deploymentRepo,
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
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return "", errors.New("workspace not found")
	}

	deployment, err := s.DeploymentRepo.GetByUUIDAndWorkspace(tx, deploymentUUID, workspace.ID)
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

func (s *DashboardService) GetOverview(tx *gorm.DB, workspaceUUID string) (*dtos_dashboard.OverviewDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	dayAgo := time.Now().Add(-24 * time.Hour)
	weekAgo := time.Now().AddDate(0, 0, -7)

	activeServices, err := s.ServiceRepo.CountByWorkspaceAndStatuses(tx, workspace.ID, []string{"success", "deploying", "pending"})
	if err != nil {
		return nil, err
	}

	totalProjects, err := s.ProjectRepo.CountByWorkspace(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	totalServices, err := s.ProjectRepo.CountServicesByWorkspace(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	runningServices, err := s.ServiceRepo.CountByWorkspaceAndStatuses(tx, workspace.ID, []string{"success", "deploying"})
	if err != nil {
		return nil, err
	}

	successRate24h, err := s.getDeploymentSuccessRate(tx, workspace.ID, dayAgo)
	if err != nil {
		return nil, err
	}

	successRate7d, err := s.getDeploymentSuccessRate(tx, workspace.ID, weekAgo)
	if err != nil {
		return nil, err
	}

	recentDeployments, err := s.DeploymentRepo.GetRecentDeploymentsByWorkspace(tx, workspace.ID, 10)
	if err != nil {
		return nil, err
	}

	lastDeployment, err := s.DeploymentRepo.GetLatestDeploymentByWorkspace(tx, workspace.ID)
	var lastDeploymentTime *time.Time
	if err == nil && lastDeployment != nil {
		lastDeploymentTime = &lastDeployment.StartTime
	}

	alerts := make([]dtos_dashboard.OverviewAlertDTO, 0)
	failedServices, err := s.ServiceRepo.GetServicesByWorkspaceAndStatus(tx, workspace.ID, "failed", 5)
	if err != nil {
		return nil, err
	}
	for _, service := range failedServices {
		alerts = append(alerts, dtos_dashboard.OverviewAlertDTO{
			ID:        service.UUID.String(),
			Type:      "service_down",
			Title:     "Service down",
			Message:   fmt.Sprintf("%s is reporting a failed runtime state", service.Name),
			Severity:  "critical",
			Status:    service.Status,
			CreatedAt: service.UpdatedAt,
		})
	}

	for _, deployment := range recentDeployments {
		if deployment.Status != "failed" {
			continue
		}

		alertType := "failed_deployment"
		title := "Failed deployment"
		if deployment.Logs != "" {
			alertType = "build_failure"
			title = "Build failure"
		}

		alerts = append(alerts, dtos_dashboard.OverviewAlertDTO{
			ID:        deployment.UUID.String(),
			Type:      alertType,
			Title:     title,
			Message:   fmt.Sprintf("%s deployment failed", deployment.Service.Name),
			Severity:  "critical",
			Status:    deployment.Status,
			CreatedAt: deployment.CreatedAt,
		})
	}

	activities := make([]dtos_dashboard.OverviewActivityDTO, 0, len(recentDeployments))
	for _, deployment := range recentDeployments {
		activities = append(activities, dtos_dashboard.OverviewActivityDTO{
			ID:        deployment.UUID.String(),
			Type:      "deployment",
			Title:     fmt.Sprintf("%s deployment %s", deployment.Service.Name, deployment.Status),
			Status:    deployment.Status,
			CreatedAt: deployment.CreatedAt,
		})
	}

	return &dtos_dashboard.OverviewDTO{
		ActiveServices: activeServices,
		TotalProjects:  totalProjects,
		TotalServices:  totalServices,
		SuccessRate:    successRate7d,
		SuccessRate24h: successRate24h,
		SuccessRate7d:  successRate7d,
		ActiveAlerts:   int64(len(alerts)),
		LastDeployment: lastDeploymentTime,
		Alerts:         alerts,
		Activities:     activities,
		SystemLoad: dtos_dashboard.SystemLoadDTO{
			CPU:             0,
			Memory:          0,
			RunningServices: runningServices,
		},
	}, nil
}

func (s *DashboardService) getDeploymentSuccessRate(tx *gorm.DB, workspaceID uint, since time.Time) (float64, error) {
	totalDeployments, err := s.DeploymentRepo.CountByWorkspaceSince(tx, workspaceID, since)
	if err != nil {
		return 0, err
	}
	if totalDeployments == 0 {
		return 0, nil
	}

	successfulDeployments, err := s.DeploymentRepo.CountByWorkspaceAndStatusSince(tx, workspaceID, "success", since)
	if err != nil {
		return 0, err
	}

	return math.Round((float64(successfulDeployments)/float64(totalDeployments))*1000) / 10, nil
}
