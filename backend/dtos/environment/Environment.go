package dtos_environment

type ResponseEnvironmentDTO struct {
	UUID      string `json:"uuid"`
	Name      string `json:"name"`
	ProjectID uint   `json:"project_id"`
	CreatedAt string `json:"created_at"`
}
