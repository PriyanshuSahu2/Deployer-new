package dtos_dashboard

import (
	dtos_service "backend/dtos/service"
)

type DashboardStatsDTO struct {
	TotalProjects       int64                               `json:"total_projects"`
	TotalServices       int64                               `json:"total_services"`
	TotalServers        int64                               `json:"total_servers"`
	TotalDeployments    int64                               `json:"total_deployments"`
	RecentDeployments    []dtos_service.DeploymentResponseDTO `json:"recent_deployments"`
}
