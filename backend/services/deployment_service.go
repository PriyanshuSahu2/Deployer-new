package services

import (
	dtos_service "backend/dtos/service"
	models_service "backend/models/service"
	"backend/repositories"
	"encoding/base64"
	"fmt"
	"os"
	"strings"
	"time"
)

type DeploymentService interface {
	RunDeployment(service *dtos_service.ServiceDetailsResponseDTO, serviceUUID string, workspaceUUID string, deploymentUUID string)
	CreateDir(sshClient SSHClient, path string, logger func(string)) error
	TransferPermission(sshClient SSHClient, username string, path string, logger func(string)) error
	BuildService(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string, logger func(string)) error
	SetupNginx(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, logger func(string)) error
	SetupSSL(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, logger func(string)) error
	SetupSystemd(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string, logger func(string)) error
}

type deploymentService struct {
	SSHService     SSHService
	GitService     GitService
	ServiceRepo    *repositories.ServiceRepository
	DeploymentRepo *repositories.DeploymentRepository
}

func NewDeploymentService(sshService SSHService, gitService GitService, serviceRepo *repositories.ServiceRepository, deploymentRepo *repositories.DeploymentRepository) DeploymentService {
	return &deploymentService{
		SSHService:     sshService,
		GitService:     gitService,
		ServiceRepo:    serviceRepo,
		DeploymentRepo: deploymentRepo,
	}
}

func (s *deploymentService) RunDeployment(service *dtos_service.ServiceDetailsResponseDTO, serviceUUID string, workspaceUUID string, deploymentUUID string) {
	logDir := "logs/deployments"
	os.MkdirAll(logDir, os.ModePerm)
	logFile, _ := os.OpenFile(fmt.Sprintf("%s/%s.log", logDir, serviceUUID), os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if logFile != nil {
		defer logFile.Close()
	}

	var logBuilder strings.Builder

	logger := func(msg string) {
		fmt.Println(msg)
		logBuilder.WriteString(msg + "\n")
		if logFile != nil {
			logFile.WriteString(msg + "\n")
		}
	}

	logger(fmt.Sprintf("\033[36mStarting deployment for service %s...\033[0m", service.Name))

	// Get service details
	dbService, _ := s.ServiceRepo.GetByUUID(nil, serviceUUID)

	// Fetch existing deployment record or create a fallback
	deployment, err := s.DeploymentRepo.GetByUUID(nil, deploymentUUID)
	if err != nil || deployment == nil {
		logger("\033[33mWarning: existing deployment record not found, creating new one.\033[0m")
		deployment = &models_service.Deployment{
			ServiceID: dbService.ID,
			Status:    "deploying",
			StartTime: time.Now(),
		}
		s.DeploymentRepo.Create(nil, deployment)
	} else {
		deployment.Status = "deploying"
		deployment.StartTime = time.Now()
		s.DeploymentRepo.Update(nil, deployment)
	}

	dbService.Status = "deploying"
	s.ServiceRepo.UpdateService(nil, dbService)

	sshClient, err := s.SSHService.Connect(
		service.Server.Host,
		service.Server.Port,
		service.Server.Username,
		[]byte(service.Server.PassKey),
	)
	if err != nil {
		logger(fmt.Sprintf("\033[31mError connecting to ssh: %v\033[0m", err))
		deployment.Status = "failed"
		deployment.Logs = logBuilder.String()
		now := time.Now()
		deployment.EndTime = &now
		s.DeploymentRepo.Update(nil, deployment)
		dbService.Status = "failed"
		s.ServiceRepo.UpdateService(nil, dbService)
		return
	}
	defer sshClient.Close()
	logger("\033[32mSuccessfully connected to target server via SSH.\033[0m")

	var basePath string = "/var/www/" + service.Project.Name + "/" + service.Environment.Name + "/" + service.Name

	checkCmd := fmt.Sprintf("[ -d \"%s/.git\" ] && echo 'exists' || echo 'not_exists'", basePath)
	out, err := sshClient.RunCommand(checkCmd)
	if err != nil {
		logger(fmt.Sprintf("\033[31mError checking project directory: %v\033[0m", err))
		return
	}

	isUpdate := strings.TrimSpace(out) == "exists"
	if !isUpdate {
		logger("\033[36mFirst time deployment. Performing initial setup...\033[0m")
		err = s.InstallDependencies(sshClient, logger)
		if err != nil {
			logger(fmt.Sprintf("\033[31mError installing dependencies: %v\033[0m", err))
			return
		}

		err = s.CreateDir(sshClient, basePath, logger)
		if err != nil {
			logger(fmt.Sprintf("\033[31mError creating dir: %v\033[0m", err))
			return
		}

		err = s.TransferPermission(sshClient, service.Server.Username, basePath, logger)
		if err != nil {
			logger(fmt.Sprintf("\033[31mError transferring permissions: %v\033[0m", err))
			return
		}

		_, err = s.GitService.CloneRepo(sshClient, service.Git.RepositoryURL, basePath, "Github", workspaceUUID)
		if err != nil {
			logger(fmt.Sprintf("\033[31mError cloning repo: %v\033[0m", err))
			return
		}
		logger("\033[32mSuccessfully cloned repository.\033[0m")
	} else {
		logger("\033[36mUpdating existing deployment...\033[0m")
	}

	_, err = s.GitService.SwitchBranch(sshClient, basePath, service.Git.Branch)
	if err != nil {
		logger(fmt.Sprintf("\033[31mError switching branch: %v\033[0m", err))
		return
	}
	logger(fmt.Sprintf("\033[32mSwitched to branch %s.\033[0m", service.Git.Branch))

	_, err = s.GitService.Pull(sshClient, basePath)
	if err != nil {
		logger(fmt.Sprintf("\033[33mWarning pulling repo: %v\033[0m", err))
	} else {
		logger("\033[32mSuccessfully pulled latest code.\033[0m")
	}

	var buildPath string = basePath
	if service.Git.SubDirectory != "" {
		buildPath = basePath + "/" + service.Git.SubDirectory
	}

	if !isUpdate {
		err = s.SetupNginx(sshClient, service, logger)
		if err != nil {
			logger(fmt.Sprintf("\033[31mError setting up Nginx: %v\033[0m", err))
			return
		}

		if service.HttpsEnabled {
			err = s.SetupSSL(sshClient, service, logger)
			if err != nil {
				logger(fmt.Sprintf("\033[31mError setting up SSL: %v\033[0m", err))
				return
			}
		}
	}

	err = s.BuildService(sshClient, service, buildPath, logger)
	if err != nil {
		logger(fmt.Sprintf("\033[31mError building service: %v\033[0m", err))
		return
	}

	if service.Type != "static" && service.Type != "frontend" && service.DockerizeType != "compose" {
		if !isUpdate {
			err = s.SetupSystemd(sshClient, service, buildPath, logger)
			if err != nil {
				logger(fmt.Sprintf("\033[31mError setting up systemd: %v\033[0m", err))
				return
			}
		} else {
			logger("\033[36mRestarting service via systemd...\033[0m")
			serviceName := fmt.Sprintf("%s-%s-%s.service", service.Project.Name, service.Environment.Name, service.Name)
			_, err = sshClient.RunCommand(fmt.Sprintf("sudo systemctl restart %s", serviceName))
			if err != nil {
				logger(fmt.Sprintf("\033[31mError restarting service: %v\033[0m", err))
				return
			}
			logger("\033[32mSuccessfully restarted service.\033[0m")
		}
	}

	logger("\033[36mCleaning up dangling images...\033[0m")
	_, err = sshClient.RunCommand("sudo docker image prune -f")
	if err != nil {
		logger(fmt.Sprintf("\033[33mWarning: failed to prune dangling images: %v\033[0m", err))
	} else {
		logger("\033[32mCleanup complete.\033[0m")
	}
	logger("\033[32m\033[1mDeployment finished successfully!\033[0m")

	deployment.Status = "success"
	deployment.Logs = logBuilder.String()
	now := time.Now()
	deployment.EndTime = &now
	s.DeploymentRepo.Update(nil, deployment)

	dbService.Status = "success"
	s.ServiceRepo.UpdateService(nil, dbService)
}

func (s *deploymentService) CreateDir(sshClient SSHClient, path string, logger func(string)) error {
	cmd := fmt.Sprintf("sudo mkdir -p %s", path)
	_, err := sshClient.RunCommand(cmd)
	if err != nil {
		return err
	}
	return nil
}

func (s *deploymentService) BuildService(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string, logger func(string)) error {
	logChan := make(chan string)
	errChan := make(chan error, 1)

	imageName := strings.ToLower(fmt.Sprintf("%s-%s-%s", service.Project.Name, service.Environment.Name, service.Name))

	go func() {
		defer close(logChan)

		// Generate .env file on the server (Always create it to prevent docker-compose from failing)
		var envContent strings.Builder
		for _, env := range service.EnvVariables {
			envContent.WriteString(fmt.Sprintf("%s=%s\n", env.Key, env.Value))
		}
		encodedEnv := base64.StdEncoding.EncodeToString([]byte(envContent.String()))
		logChan <- fmt.Sprintf("\033[36mWriting .env file to: %s/.env\033[0m", path)
		writeEnvCmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s/.env > /dev/null", encodedEnv, path)
		if _, err := sshClient.RunCommand(writeEnvCmd); err != nil {
			errChan <- fmt.Errorf("Error writing .env file: %v", err)
			return
		}
		logChan <- "\033[32mEnvironment file (.env) prepared successfully.\033[0m"

		switch service.DockerizeType {
		case "compose":
			logChan <- "\033[36mUsing Docker Compose for deployment as specified...\033[0m"
			// Check for docker-compose.yml or docker-compose.yaml
			checkCmd := fmt.Sprintf("[ -f \"%s/docker-compose.yml\" ] || [ -f \"%s/docker-compose.yaml\" ] && echo 'exists' || echo 'not_exists'", path, path)
			out, _ := sshClient.RunCommand(checkCmd)
			if strings.TrimSpace(out) != "exists" {
				errChan <- fmt.Errorf("docker-compose.yml or docker-compose.yaml not found in project root")
				return
			}

			composeCmd := fmt.Sprintf("cd %s && sudo docker compose up -d --build", path)
			err := sshClient.RunCommandStream(composeCmd, logChan)
			if err != nil {
				errChan <- fmt.Errorf("Error running docker compose: %v", err)
				return
			}
			logChan <- "\033[32mDocker Compose deployment successful!\033[0m"
		case "auto":
			switch service.Framework {
			case "node":
				startCmd := service.StartCommand
				if startCmd == "" {
					startCmd = "npm start"
				}
				dockerfile := fmt.Sprintf(NodeDockerfileTemplate, service.BuildCommand, service.Port, service.Port, startCmd)

				encodedDf := base64.StdEncoding.EncodeToString([]byte(dockerfile))
				writeCmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s/Dockerfile > /dev/null", encodedDf, path)
				if _, err := sshClient.RunCommand(writeCmd); err != nil {
					errChan <- fmt.Errorf("Error writing Dockerfile: %v", err)
					return
				}
				logChan <- "\033[36mAuto-generated Node Dockerfile successfully.\033[0m"
			case "bun":
				startCmd := service.StartCommand
				if startCmd == "" {
					startCmd = "bun start"
				}
				dockerfile := fmt.Sprintf(BunDockerfileTemplate, service.BuildCommand, service.Port, service.Port, startCmd)

				encodedDf := base64.StdEncoding.EncodeToString([]byte(dockerfile))
				writeCmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s/Dockerfile > /dev/null", encodedDf, path)
				if _, err := sshClient.RunCommand(writeCmd); err != nil {
					errChan <- fmt.Errorf("Error writing Dockerfile: %v", err)
					return
				}
				logChan <- "\033[36mAuto-generated Bun Dockerfile successfully.\033[0m"
			case "go":
				startCmd := service.StartCommand
				if startCmd == "" {
					startCmd = "./main"
				}
				buildCmd := service.BuildCommand
				if buildCmd == "" {
					buildCmd = "go build -o main ."
				}
				dockerfile := fmt.Sprintf(GoDockerfileTemplate, buildCmd, service.Port, service.Port, startCmd)

				encodedDf := base64.StdEncoding.EncodeToString([]byte(dockerfile))
				writeCmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s/Dockerfile > /dev/null", encodedDf, path)
				if _, err := sshClient.RunCommand(writeCmd); err != nil {
					errChan <- fmt.Errorf("Error writing Dockerfile: %v", err)
					return
				}
				logChan <- "\033[36mAuto-generated Go Dockerfile successfully.\033[0m"
			case "python":
				startCmd := service.StartCommand
				if startCmd == "" {
					startCmd = "python main.py"
				}
				dockerfile := fmt.Sprintf(PythonDockerfileTemplate, service.BuildCommand, service.Port, service.Port, startCmd)

				encodedDf := base64.StdEncoding.EncodeToString([]byte(dockerfile))
				writeCmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s/Dockerfile > /dev/null", encodedDf, path)
				if _, err := sshClient.RunCommand(writeCmd); err != nil {
					errChan <- fmt.Errorf("Error writing Dockerfile: %v", err)
					return
				}
				logChan <- "\033[36mAuto-generated Python Dockerfile successfully.\033[0m"
			}
		}

		buildCmd := fmt.Sprintf("cd %s && sudo docker build -t %s .", path, imageName)
		logChan <- "\033[36mStarting docker build process...\033[0m"
		err := sshClient.RunCommandStream(buildCmd, logChan)
		if err != nil {
			errChan <- fmt.Errorf("Error running docker build: %v", err)
			return
		}

		if service.Type == "static" || service.Type == "frontend" {
			outDir := service.OutputDirectory
			if outDir == "" {
				outDir = "dist"
			}
			logChan <- fmt.Sprintf("\033[36mExtracting built static files (%s) for Nginx to serve...\033[0m", outDir)
			extractCmd := fmt.Sprintf(`
			sudo rm -rf %[2]s/%[3]s
			sudo docker create --name extract-%[1]s %[1]s
			sudo docker cp extract-%[1]s:/app/%[3]s %[2]s/%[3]s || sudo docker cp extract-%[1]s:/app/out %[2]s/%[3]s || sudo docker cp extract-%[1]s:/app/build %[2]s/%[3]s || true
			sudo docker rm -v extract-%[1]s
			`, imageName, path, outDir)
			if _, err := sshClient.RunCommand(extractCmd); err != nil {
				errChan <- fmt.Errorf("Error extracting static files: %v", err)
				return
			}
			logChan <- "\033[32mExtraction complete!\033[0m"
		}

		errChan <- nil
	}()

	for log := range logChan {
		logger(log)
	}

	return <-errChan
}

func (s *deploymentService) SetupSystemd(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string, logger func(string)) error {
	logger("\033[36mConfiguring systemd service wrapper...\033[0m")
	serviceName := fmt.Sprintf("%s-%s-%s.service", service.Project.Name, service.Environment.Name, service.Name)
	imageName := strings.ToLower(fmt.Sprintf("%s-%s-%s", service.Project.Name, service.Environment.Name, service.Name))
	serviceFile := fmt.Sprintf("/etc/systemd/system/%s", serviceName)

	config := fmt.Sprintf(SystemdServiceTemplate, serviceName, imageName, service.Port)

	encodedConfig := base64.StdEncoding.EncodeToString([]byte(config))
	cmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s > /dev/null", encodedConfig, serviceFile)

	_, err := sshClient.RunCommand(cmd)
	if err != nil {
		return err
	}

	_, err = sshClient.RunCommand("sudo systemctl daemon-reload")
	if err != nil {
		return err
	}

	_, err = sshClient.RunCommand(fmt.Sprintf("sudo systemctl enable %s", serviceName))
	if err != nil {
		return err
	}

	_, err = sshClient.RunCommand(fmt.Sprintf("sudo systemctl restart %s", serviceName))
	if err != nil {
		return err
	}

	return nil
}

func (s *deploymentService) TransferPermission(sshClient SSHClient, username string, path string, logger func(string)) error {
	cmd := fmt.Sprintf("sudo chown -R %s:%s %s", username, username, path)
	_, err := sshClient.RunCommand(cmd)
	if err != nil {
		return err
	}
	return nil
}

func (s *deploymentService) InstallDependencies(sshClient SSHClient, logger func(string)) error {
	logChan := make(chan string)

	go func() {
		defer close(logChan)

		cmd := DockerInstallScript

		err := sshClient.RunCommandStream(cmd, logChan)
		if err != nil {
			logger(fmt.Sprintf("\033[31mError installing dependencies: %v\033[0m", err))
			return
		}
	}()

	for log := range logChan {
		logger(log)
	}

	return nil
}

func (s *deploymentService) SetupNginx(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, logger func(string)) error {
	logger("\033[36mConfiguring Nginx routing and proxies...\033[0m")
	nginxFile := fmt.Sprintf("/etc/nginx/sites-available/%s-%s-%s.conf", service.Project.Name, service.Environment.Name, service.Name)

	domain := service.Domain
	if domain == "" {
		domain = fmt.Sprintf("test-%s.myapico.live", service.Name)
	}

	var config string
	if service.Type == "static" || service.Type == "frontend" {
		documentRoot := fmt.Sprintf("/var/www/%s/%s/%s", service.Project.Name, service.Environment.Name, service.Name)
		if service.DeployPath != "" && service.DeployPath != "/" {
			documentRoot = fmt.Sprintf("%s/%s", documentRoot, service.DeployPath)
		}
		outDir := service.OutputDirectory
		if outDir == "" {
			outDir = "dist"
		}
		documentRoot = fmt.Sprintf("%s/%s", documentRoot, outDir)

		config = fmt.Sprintf(NginxStaticTemplate, domain, documentRoot)
	} else {
		config = fmt.Sprintf(NginxProxyTemplate, domain, fmt.Sprintf("%d", service.Port))
	}

	encodedConfig := base64.StdEncoding.EncodeToString([]byte(config))
	cmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s > /dev/null", encodedConfig, nginxFile)

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

func (s *deploymentService) SetupSSL(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, logger func(string)) error {
	logger("\033[36mSetting up SSL certificates...\033[0m")
	if service.Domain == "" {
		return fmt.Errorf("domain is required for SSL setup")
	}

	if service.CertType == "auto" {
		cmd := fmt.Sprintf("sudo certbot --nginx -d %s --non-interactive --agree-tos --register-unsafely-without-email", service.Domain)
		_, err := sshClient.RunCommand(cmd)
		if err != nil {
			return fmt.Errorf("certbot failed: %w", err)
		}
	} else if service.CertType == "custom" && service.CustomCert != "" && service.CustomKey != "" {
		sslDir := fmt.Sprintf("/etc/nginx/ssl/%s", service.Domain)
		_, err := sshClient.RunCommand(fmt.Sprintf("sudo mkdir -p %s", sslDir))
		if err != nil {
			return err
		}

		certFile := fmt.Sprintf("%s/fullchain.pem", sslDir)
		keyFile := fmt.Sprintf("%s/privkey.pem", sslDir)

		encodedCert := base64.StdEncoding.EncodeToString([]byte(service.CustomCert))
		encodedKey := base64.StdEncoding.EncodeToString([]byte(service.CustomKey))

		_, err = sshClient.RunCommand(fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s > /dev/null", encodedCert, certFile))
		if err != nil {
			return err
		}
		_, err = sshClient.RunCommand(fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s > /dev/null", encodedKey, keyFile))
		if err != nil {
			return err
		}

		nginxFile := fmt.Sprintf("/etc/nginx/sites-available/%s-%s-%s.conf", service.Project.Name, service.Environment.Name, service.Name)

		var config string
		if service.Type == "static" || service.Type == "frontend" {
			documentRoot := fmt.Sprintf("/var/www/%s/%s/%s", service.Project.Name, service.Environment.Name, service.Name)
			if service.DeployPath != "" && service.DeployPath != "/" {
				documentRoot = fmt.Sprintf("%s/%s", documentRoot, service.DeployPath)
			}
			outDir := service.OutputDirectory
			if outDir == "" {
				outDir = "dist"
			}
			documentRoot = fmt.Sprintf("%s/%s", documentRoot, outDir)

			config = fmt.Sprintf(NginxSSLStaticTemplate, service.Domain, service.Domain, certFile, keyFile, documentRoot)
		} else {
			config = fmt.Sprintf(NginxSSLProxyTemplate, service.Domain, service.Domain, certFile, keyFile, fmt.Sprintf("%d", service.Port))
		}

		encodedConfig := base64.StdEncoding.EncodeToString([]byte(config))
		_, err = sshClient.RunCommand(fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s > /dev/null", encodedConfig, nginxFile))
		if err != nil {
			return err
		}

		_, err = sshClient.RunCommand("sudo systemctl reload nginx")
		if err != nil {
			return err
		}
	}

	return nil
}
