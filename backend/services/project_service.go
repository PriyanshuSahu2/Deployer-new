package services

import (
	"errors"

	dtos_project "backend/dtos/project"
	models_project "backend/models/project"
	"backend/repositories"
)

type ProjectService struct {
	ProjectRepo   *repositories.ProjectRepository
	WorkspaceRepo *repositories.WorkspaceRepository
}

func NewProjectService(
	projectRepo *repositories.ProjectRepository,
	workspaceRepo *repositories.WorkspaceRepository,
) *ProjectService {
	return &ProjectService{
		ProjectRepo:   projectRepo,
		WorkspaceRepo: workspaceRepo,
	}
}

func (s *ProjectService) CreateProject(userID uint, workspaceUUID string, dto dtos_project.CreateProjectDTO) error {
	workspace, err := s.WorkspaceRepo.GetByUUID(workspaceUUID)
	if err != nil {
		return errors.New("workspace not found")
	}

	project := models_project.Project{
		Name:        dto.Name,
		Description: dto.Description,
		Framework:   dto.Framework,
		WorkspaceID: workspace.ID,
		CreatedBy:   userID,
	}

	return s.ProjectRepo.Create(&project)
}

func (s *ProjectService) UpdateProject(userID uint, dto dtos_project.UpdateProjectDTO) error {
	project, err := s.ProjectRepo.GetByUUID(dto.UUID)
	if err != nil {
		return errors.New("project not found")
	}

	project.Name = dto.Name
	project.Description = dto.Description
	project.Framework = dto.Framework

	return s.ProjectRepo.Update(project)
}

func (s *ProjectService) ListProjects(userID uint, workspaceUUID string) ([]dtos_project.ProjectResponseDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	projects, err := s.ProjectRepo.ListByWorkspace(workspace.ID)
	if err != nil {
		return nil, err
	}

	response := make([]dtos_project.ProjectResponseDTO, len(projects))
	for i, project := range projects {
		response[i] = dtos_project.ProjectResponseDTO{
			UUID:        project.UUID.String(),
			Name:        project.Name,
			Description: project.Description,
			Framework:   project.Framework,
			WorkspaceID: project.WorkspaceID,
			CreatedBy:   project.CreatedBy,
			CreatedAt:   project.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	return response, nil
}

func (s *ProjectService) DeleteProject(userID uint, projectUUID string) error {
	project, err := s.ProjectRepo.GetByUUID(projectUUID)
	if err != nil {
		return errors.New("project not found")
	}

	return s.ProjectRepo.Delete(project)
}
