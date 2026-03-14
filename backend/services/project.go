package services

import (
	"errors" // Keep this import

	"backend/db" // Added import
	dtos_environment "backend/dtos/environment"
	dtos_project "backend/dtos/project"
	models_environment "backend/models/environment" // Added import
	models_project "backend/models/project"
	"backend/repositories"

	"gorm.io/gorm" // Added import
)

type ProjectService struct {
	ProjectRepo     *repositories.ProjectRepository
	WorkspaceRepo   *repositories.WorkspaceRepository
	EnvironmentRepo *repositories.EnvironmentRepository
}

func NewProjectService(
	projectRepo *repositories.ProjectRepository,
	workspaceRepo *repositories.WorkspaceRepository,
	environmentRepo *repositories.EnvironmentRepository,
) *ProjectService {
	return &ProjectService{
		ProjectRepo:     projectRepo,
		WorkspaceRepo:   workspaceRepo,
		EnvironmentRepo: environmentRepo,
	}
}

func (s *ProjectService) CreateProject(tx *gorm.DB, userID uint, workspaceUUID string, dto dtos_project.CreateProjectDTO) error {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return errors.New("workspace not found")
	}

	query := db.DB
	if tx != nil {
		query = tx
	}

	return query.Transaction(func(tx2 *gorm.DB) error {
		project := models_project.Project{
			Name:        dto.Name,
			Description: dto.Description,
			WorkspaceID: workspace.ID,
			CreatedBy:   userID,
		}

		if err := s.ProjectRepo.Create(tx2, &project); err != nil {
			return err
		}

		defaults := []string{"Production"}
		for _, name := range defaults {
			env := models_environment.Environment{
				Name:      name,
				ProjectID: project.ID,
				CreatedBy: userID,
			}
			if err := s.EnvironmentRepo.Create(tx2, &env); err != nil {
				return err
			}
		}

		return nil
	})
}

func (s *ProjectService) UpdateProject(tx *gorm.DB, userID uint, dto dtos_project.UpdateProjectDTO) error {

	project, err := s.ProjectRepo.GetByUUID(tx, dto.UUID)
	if err != nil {
		return errors.New("project not found")
	}

	project.Name = dto.Name
	project.Description = dto.Description

	return s.ProjectRepo.Update(tx, project)
}

func (s *ProjectService) ListProjects(tx *gorm.DB, userID uint, workspaceUUID string) ([]dtos_project.ProjectResponseDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	projects, err := s.ProjectRepo.ListByWorkspace(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	response := make([]dtos_project.ProjectResponseDTO, len(projects))
	for i, project := range projects {
		response[i] = dtos_project.ProjectResponseDTO{
			UUID:        project.UUID.String(),
			Name:        project.Name,
			Description: project.Description,
			WorkspaceID: project.WorkspaceID,
			CreatedBy:   project.CreatedBy,
			CreatedAt:   project.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	return response, nil
}

func (s *ProjectService) DeleteProject(tx *gorm.DB, userID uint, projectUUID string) error {
	project, err := s.ProjectRepo.GetByUUID(tx, projectUUID)
	if err != nil {
		return errors.New("project not found")
	}

	return s.ProjectRepo.Delete(tx, project)
}

func (s *ProjectService) GetProjectDetails(tx *gorm.DB, userID uint, projectUUID string) (dtos_project.ProjectResponseDTO, error) {
	project, err := s.ProjectRepo.GetByUUID(tx, projectUUID)
	if err != nil {
		return dtos_project.ProjectResponseDTO{}, err
	}

	environments, _ := s.EnvironmentRepo.ListByProject(tx, project.ID)

	envDTOs := make([]dtos_environment.ResponseEnvironmentDTO, len(environments))
	for i, env := range environments {
		envDTOs[i] = dtos_environment.ResponseEnvironmentDTO{
			UUID:      env.UUID.String(),
			Name:      env.Name,
			ProjectID: env.ProjectID,
			CreatedAt: env.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	projectResponse := dtos_project.ProjectResponseDTO{
		UUID:         project.UUID.String(),
		Name:         project.Name,
		Description:  project.Description,
		WorkspaceID:  project.WorkspaceID,
		CreatedBy:    project.CreatedBy,
		CreatedAt:    project.CreatedAt.Format("2006-01-02 15:04:05"),
		Environments: envDTOs,
	}
	return projectResponse, nil
}
