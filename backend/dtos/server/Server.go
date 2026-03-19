package dtos_server

type CreateServerDTO struct {
	Name     string `json:"name" binding:"required,min=2"`
	Host     string `json:"host" binding:"required"`
	Port     int    `json:"port" binding:"required,min=1,max=65535"`
	Username string `json:"username" binding:"required"`
	AuthType string `json:"auth_type" binding:"required"`
	PassKey  string `json:"pass_key"`
}

type UpdateServerDTO struct {
	UUID     string `json:"uuid"`
	Name     string `json:"name" binding:"required,min=2"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	AuthType string `json:"auth_type"`
	PassKey  string `json:"pass_key"`
}

type ServerResponseDTO struct {
	UUID        string `json:"uuid"`
	WorkspaceID uint   `json:"workspace_id"`
	Name        string `json:"name"`
	Host        string `json:"host"`
	Port        int    `json:"port"`
	Username    string `json:"username"`
	AuthType    string `json:"auth_type"`
	PassKey     string `json:"pass_key"`
	CreatedByID uint   `json:"created_by_id"`
	CreatedAt   string `json:"created_at"`
}

type TestConnectionDTO struct {
	UUID     string `json:"uuid"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	AuthType string `json:"auth_type"`
	PassKey  string `json:"pass_key"`
}
