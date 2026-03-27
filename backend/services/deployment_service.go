package services

import (
	dtos_service "backend/dtos/service"
	"fmt"
)

type DeploymentService interface {
	RunDeployment(service *dtos_service.ServiceDetailsResponseDTO, serviceUUID string, workspaceUUID string)
	CreateDir(sshClient SSHClient, path string) error
	TransferPermission(sshClient SSHClient, username string, path string) error
	BuildAndStartService(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string) error
}

type deploymentService struct {
	SSHService SSHService
	GitService GitService
}

func NewDeploymentService(sshService SSHService, gitService GitService) DeploymentService {
	return &deploymentService{
		SSHService: sshService,
		GitService: gitService,
	}
}

func (s *deploymentService) RunDeployment(service *dtos_service.ServiceDetailsResponseDTO, serviceUUID string, workspaceUUID string) {
	sshClient, err := s.SSHService.Connect(
		service.Server.Host,
		service.Server.Port,
		service.Server.Username,
		[]byte(service.Server.PassKey),
	)
	if err != nil {
		fmt.Printf("Error running deployment clone: %v\n", err)
		return
	}
	defer sshClient.Close()
	err = s.InstallDependencies(sshClient)
	if err != nil {
		fmt.Printf("Error running deployment install dependencies: %v\n", err)
		return
	}
	var path string = "/var/www/" + service.Project.Name + "/" + service.Environment.Name + "/" + service.Name
	err = s.CreateDir(sshClient, path)

	if err != nil {
		fmt.Printf("Error running deployment create dir: %v\n", err.Error())
		return
	}

	err = s.TransferPermission(sshClient, service.Server.Username, path)
	if err != nil {
		fmt.Printf("Error running deployment transfer permission: %v\n", err)
		return
	}

	_, err = s.GitService.CloneRepo(sshClient, service.Git.RepositoryURL, path, "Github", workspaceUUID)
	if err != nil {
		fmt.Printf("Error running deployment clone: %v\n", err)
		return
	}

	_, err = s.GitService.SwitchBranch(sshClient, path, service.Git.Branch)
	if err != nil {
		fmt.Printf("Error running deployment switch branch: %v\n", err)
		return
	}

	_, err = s.GitService.Pull(sshClient, path)
	if service.Git.SubDirectory != "" {
		path = path + "/" + service.Git.SubDirectory
	}
	err = s.SetupNginx(sshClient, service)
	if err != nil {
		fmt.Printf("Error running deployment setup nginx: %v\n", err.Error())
		return
	}
	err = s.BuildAndStartService(sshClient, service, path)
	if err != nil {
		fmt.Printf("Error running deployment pull: %v\n", err.Error())
		return
	}

}

func (s *deploymentService) CreateDir(sshClient SSHClient, path string) error {
	cmd := fmt.Sprintf("sudo mkdir -p %s", path)
	_, err := sshClient.RunCommand(cmd)
	if err != nil {
		return err
	}
	return nil
}

func (s *deploymentService) BuildAndStartService(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string) error {
	logChan := make(chan string)

	go func() {
		defer close(logChan)
		buildCmd := fmt.Sprintf("cd %s  && %s && %s && %s", path, "npm install", service.BuildCommand, service.StartCommand)
		err := sshClient.RunCommandStream(wrapWithNVM(buildCmd), logChan)
		if err != nil {
			fmt.Printf("Error running deployment build: %v\n", err)
			return
		}
	}()

	for log := range logChan {
		fmt.Println(log)
	}

	return nil
}

func (s *deploymentService) TransferPermission(sshClient SSHClient, username string, path string) error {
	cmd := fmt.Sprintf("sudo chown -R %s:%s %s", username, username, path)
	_, err := sshClient.RunCommand(cmd)
	if err != nil {
		return err
	}
	return nil
}

func (s *deploymentService) InstallDependencies(sshClient SSHClient) error {
	logChan := make(chan string)

	go func() {
		defer close(logChan)

		cmd := `
		# Install NVM if not exists
		export NVM_DIR="$HOME/.nvm"
		[ -s "$NVM_DIR/nvm.sh" ] || curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

		# Load NVM
		. "$NVM_DIR/nvm.sh"

		# Install & use Node LTS
		nvm install --lts
		nvm use --lts

		# Verify
		node -v
		npm -v
		`

		err := sshClient.RunCommandStream(cmd, logChan)
		if err != nil {
			logChan <- fmt.Sprintf("Error installing dependencies: %v", err)
			return
		}
	}()

	for log := range logChan {
		fmt.Println(log)
	}

	return nil
}
func (s *deploymentService) SetupNginx(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO) error {
	nginxFile := fmt.Sprintf("/etc/nginx/sites-available/%s-%s-%s.conf", service.Project.Name, service.Environment.Name, service.Name)

	// Nginx config
	config := fmt.Sprintf(`
server {
    listen 80;
    server_name %s;

    location / {
        proxy_pass http://localhost:%s;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
`, "www.myapico.live myapico.live", "4173")

	cmd := fmt.Sprintf(`cat <<'EOF' | sudo tee %s
%s
EOF`, nginxFile, config)

	_, err := sshClient.RunCommand(cmd)
	if err != nil {
		return err
	}
	_, err = sshClient.RunCommand(fmt.Sprintf("sudo ln -s %s /etc/nginx/sites-enabled/", nginxFile))

	_, err = sshClient.RunCommand("sudo nginx -t")
	if err != nil {
		return err
	}

	_, err = sshClient.RunCommand("sudo systemctl reload nginx")
	if err != nil {
		return err
	}

	return nil
}
func wrapWithNVM(cmd string) string {
	return `
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

` + cmd
}
