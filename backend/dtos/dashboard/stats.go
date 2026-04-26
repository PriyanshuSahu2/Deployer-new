package dtos_dashboard

import (
	dtos_service "backend/dtos/service"
	"time"
)

type DashboardStatsDTO struct {
	TotalProjects     int64                                `json:"total_projects"`
	TotalServices     int64                                `json:"total_services"`
	TotalServers      int64                                `json:"total_servers"`
	TotalDeployments  int64                                `json:"total_deployments"`
	RecentDeployments []dtos_service.DeploymentResponseDTO `json:"recent_deployments"`
}

type OverviewAlertDTO struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Severity  string    `json:"severity"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type OverviewActivityDTO struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type SystemLoadDTO struct {
	CPU             float64 `json:"cpu"`
	Memory          float64 `json:"memory"`
	RunningServices int64   `json:"runningServices"`
}

type OverviewDTO struct {
	ActiveServices int64                 `json:"activeServices"`
	TotalProjects  int64                 `json:"totalProjects"`
	TotalServices  int64                 `json:"totalServices"`
	SuccessRate    float64               `json:"successRate"`
	SuccessRate24h float64               `json:"successRate24h"`
	SuccessRate7d  float64               `json:"successRate7d"`
	ActiveAlerts   int64                 `json:"activeAlerts"`
	LastDeployment *time.Time            `json:"lastDeployment"`
	Alerts         []OverviewAlertDTO    `json:"alerts"`
	Activities     []OverviewActivityDTO `json:"activities"`
	SystemLoad     SystemLoadDTO         `json:"systemLoad"`
}
