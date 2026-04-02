package dtos_service

import "time"

type DeploymentResponseDTO struct {
	UUID        string     `json:"uuid"`
	ServiceID   uint       `json:"serviceId"`
	ServiceName string     `json:"serviceName"`
	Status      string     `json:"status"`
	StartTime   time.Time  `json:"startTime"`
	EndTime     *time.Time `json:"endTime"`
	Logs        string     `json:"logs"`
}
