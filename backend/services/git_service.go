package services

import (
	"backend/db"
	"fmt"
	"strings"
)

type GitService interface {
	CloneRepo(sshClient SSHClient, url string, path string, provider string, workspaceUUID string) ([]string, error)
	SwitchBranch(sshClient SSHClient, path string, branch string) (string, error)
	Pull(sshClient SSHClient, path string) (string, error)
}

type gitServiceImpl struct {
	IntegrationService *IntegrationService
}

func NewGitService(integrationService *IntegrationService) GitService {
	return &gitServiceImpl{
		IntegrationService: integrationService,
	}
}

func (g *gitServiceImpl) CloneRepo(
	sshClient SSHClient,
	url string,
	path string,
	provider string,
	workspaceUUID string,
) ([]string, error) {

	accessToken, err := g.IntegrationService.GetProviderAccessToken(db.DB, workspaceUUID, provider)
	if err != nil {
		return nil, fmt.Errorf("failed to get provider access token: %w", err)
	}

	// Clean URL
	cleanURL := strings.TrimPrefix(url, "https://github.com/")
	cleanURL = strings.TrimPrefix(cleanURL, "github.com/")

	var repoURL string
	if strings.ToLower(provider) == "github" {
		repoURL = fmt.Sprintf("https://%s@github.com/%s.git", accessToken, cleanURL)
	} else {
		repoURL = fmt.Sprintf("https://%s@%s.git", accessToken, cleanURL)
	}

	cloneCmd := fmt.Sprintf("cd %s && git clone %s .", path, repoURL)

	logChan := make(chan string)

	go func() {
		err := sshClient.RunCommandStream(cloneCmd, logChan)
		if err != nil {
			logChan <- "ERROR: " + err.Error()
		}
		close(logChan)
	}()

	for log := range logChan {
		fmt.Println(log)
	}

	setOriginCmd := fmt.Sprintf("cd %s && git remote set-url origin %s", path, repoURL)
	_, _ = sshClient.RunCommand(setOriginCmd)

	return []string{}, nil
}

func (g *gitServiceImpl) SwitchBranch(sshClient SSHClient, path string, branch string) (string, error) {
	cmd := fmt.Sprintf("cd %s && git checkout %s", path, branch)
	return sshClient.RunCommand(cmd)
}

func (g *gitServiceImpl) Pull(sshClient SSHClient, path string) (string, error) {
	// 1. Fetch latest changes from all remotes
	// 2. Force reset the current branch to match its upstream counterpart (@{u})
	// This ensures that local file changes on the server (like generated Dockerfiles)
	// do not cause merge conflicts during deployment.
	cmd := fmt.Sprintf("cd %s && git fetch --all && git reset --hard @{u}", path)
	return sshClient.RunCommand(cmd)
}
