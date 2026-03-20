package services

import (
	"backend/db"
	dtos_integration "backend/dtos/integration"
	dtos_oauth "backend/dtos/oauth"
	models_integration "backend/models/integrations"
	"backend/repositories"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"gorm.io/gorm"
)

type IntegrationService struct {
	IntegrationRepo *repositories.IntegrationRepository
	WorkspaceRepo   *repositories.WorkspaceRepository
}

func NewIntegrationService(integrationRepo *repositories.IntegrationRepository, workspaceRepo *repositories.WorkspaceRepository) *IntegrationService {
	return &IntegrationService{
		IntegrationRepo: integrationRepo,
		WorkspaceRepo:   workspaceRepo,
	}
}

// Reuse logic from controllers_auth for exchanging the token
func (s *IntegrationService) generateGithubToken(state string, code string, redirectUri string) (string, error) {
	body := map[string]string{
		"client_id":     os.Getenv("GITHUB_CLIENT_ID"),
		"client_secret": os.Getenv("GITHUB_CLIENT_SECRET"),
		"code":          code,
		"redirect_uri":  redirectUri,
		"state":         state,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", errors.New("failed to encode request body")
	}

	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", errors.New("request creation failed")
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", errors.New("request failed")
	}
	defer resp.Body.Close()

	resultBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("failed to read response body")
	}

	var result map[string]interface{}
	if err := json.Unmarshal(resultBody, &result); err != nil {
		return "", errors.New("failed to parse response")
	}

	githubAccessToken, ok := result["access_token"].(string)
	if !ok || githubAccessToken == "" {
		return "", errors.New("no access token returned")
	}

	return githubAccessToken, nil
}

func (s *IntegrationService) getGithubUserProfile(accessToken string) (dtos_oauth.GithubUserProfile, error) {
	var result dtos_oauth.GithubUserProfile
	client := &http.Client{}

	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return result, errors.New("request creation failed")
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")
	resp, err := client.Do(req)
	if err != nil {
		return result, errors.New("request failed")
	}

	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, errors.New("failed to parse profile")
	}

	return result, nil
}

func (s *IntegrationService) HandleGithubCallback(tx *gorm.DB, workspaceUUID string, code string, state string, redirectUri string) error {
	query := db.DB
	if tx != nil {
		query = tx
	}

	workspace, err := GetWorkspaceByUUID(query, workspaceUUID)
	if err != nil {
		return errors.New("workspace not found")
	}

	accessToken, err := s.generateGithubToken(state, code, redirectUri)
	if err != nil {
		return err
	}

	profile, err := s.getGithubUserProfile(accessToken)
	if err != nil {
		return err
	}

	accountId := ""
	if profile.ID != 0 {
		accountId = string(rune(profile.ID)) // Usually we just use string representation
	}

	integration := models_integration.WorkspaceGitIntegration{
		WorkspaceID: workspace.ID,
		Provider:    "github",
		AccountName: profile.Login,
		AccountID:   accountId,
		AccessToken: accessToken,
		IsActive:    true,
	}

	return s.IntegrationRepo.CreateOrUpdate(query, &integration)
}

func (s *IntegrationService) GetWorkspaceIntegrations(tx *gorm.DB, workspaceUUID string) ([]dtos_integration.IntegrationResponseDTO, error) {
	query := db.DB
	if tx != nil {
		query = tx
	}

	workspace, err := GetWorkspaceByUUID(query, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	integrations, err := s.IntegrationRepo.GetWorkSpaceIntegrations(query, workspace.ID)
	if err != nil {
		return nil, err
	}

	var response []dtos_integration.IntegrationResponseDTO
	for _, integration := range integrations {
		response = append(response, dtos_integration.IntegrationResponseDTO{
			ID:             integration.ID,
			WorkspaceID:    integration.WorkspaceID,
			Provider:       integration.Provider,
			AccountName:    integration.AccountName,
			AccountID:      integration.AccountID,
			InstallationID: integration.InstallationID,
			IsActive:       integration.IsActive,
		})
	}
	return response, nil
}

func (s *IntegrationService) DeleteIntegration(tx *gorm.DB, workspaceUUID string, provider string) error {
	query := db.DB
	if tx != nil {
		query = tx
	}

	workspace, err := GetWorkspaceByUUID(query, workspaceUUID)
	if err != nil {
		return errors.New("workspace not found")
	}

	return s.IntegrationRepo.DeleteIntegration(query, workspace.ID, provider)
}

func (s *IntegrationService) GetGithubRepos(tx *gorm.DB, workspaceUUID string) ([]dtos_integration.GithubRepoDTO, error) {
	query := db.DB
	if tx != nil {
		query = tx
	}

	workspace, err := GetWorkspaceByUUID(query, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	integration, err := s.IntegrationRepo.GetIntegrationByProvider(query, workspace.ID, "github")
	if err != nil {
		return nil, errors.New("github integration not found")
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://api.github.com/user/repos?per_page=100", nil)
	if err != nil {
		return nil, errors.New("request creation failed")
	}
	req.Header.Set("Authorization", "Bearer "+integration.AccessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.New("request failed")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github api error: status %d", resp.StatusCode)
	}

	var repos []struct {
		ID       int    `json:"id"`
		Name     string `json:"name"`
		FullName string `json:"full_name"`
		Private  bool   `json:"private"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&repos); err != nil {
		return nil, errors.New("failed to parse repositories")
	}

	var result []dtos_integration.GithubRepoDTO
	for _, repo := range repos {
		result = append(result, dtos_integration.GithubRepoDTO{
			ID:       repo.ID,
			Name:     repo.Name,
			FullName: repo.FullName,
			Private:  repo.Private,
		})
	}

	return result, nil
}

func (s *IntegrationService) GetGithubBranches(tx *gorm.DB, workspaceUUID string, repoFullName string) ([]dtos_integration.GithubBranchDTO, error) {
	query := db.DB
	if tx != nil {
		query = tx
	}

	workspace, err := GetWorkspaceByUUID(query, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	integration, err := s.IntegrationRepo.GetIntegrationByProvider(query, workspace.ID, "github")
	if err != nil {
		return nil, errors.New("github integration not found")
	}

	client := &http.Client{}
	url := fmt.Sprintf("https://api.github.com/repos/%s/branches?per_page=100", repoFullName)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, errors.New("request creation failed")
	}
	req.Header.Set("Authorization", "Bearer "+integration.AccessToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.New("request failed")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github api error: status %d", resp.StatusCode)
	}

	var branches []dtos_integration.GithubBranchDTO
	if err := json.NewDecoder(resp.Body).Decode(&branches); err != nil {
		return nil, errors.New("failed to parse branches")
	}

	return branches, nil
}

func (s *IntegrationService) GetProviderAccessToken(tx *gorm.DB, workspaceUUID string, provider string) (string, error) {
	query := db.DB
	if tx != nil {
		query = tx
	}

	workspace, err := GetWorkspaceByUUID(query, workspaceUUID)
	if err != nil {
		return "", errors.New("workspace not found")
	}

	integration, err := s.IntegrationRepo.GetIntegrationByProvider(query, workspace.ID, provider)
	if err != nil {
		return "", errors.New("integration not found")
	}

	return integration.AccessToken, nil
}
