package services

import (
	dtos_service "backend/dtos/service"
	"encoding/base64"
	"fmt"
	"strings"
)

type DeploymentService interface {
	RunDeployment(service *dtos_service.ServiceDetailsResponseDTO, serviceUUID string, workspaceUUID string)
	CreateDir(sshClient SSHClient, path string) error
	TransferPermission(sshClient SSHClient, username string, path string) error
	BuildService(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string) error
	SetupNginx(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO) error
	SetupSSL(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO) error
	SetupSystemd(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string) error
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
		fmt.Printf("Error connecting to ssh: %v\n", err)
		return
	}
	defer sshClient.Close()

	var basePath string = "/var/www/" + service.Project.Name + "/" + service.Environment.Name + "/" + service.Name
	
	checkCmd := fmt.Sprintf("[ -d \"%s/.git\" ] && echo 'exists' || echo 'not_exists'", basePath)
	out, err := sshClient.RunCommand(checkCmd)
	if err != nil {
		fmt.Printf("Error checking project directory: %v\n", err)
		return
	}

	isUpdate := strings.TrimSpace(out) == "exists"
	if !isUpdate {
		err = s.InstallDependencies(sshClient)
		if err != nil {
			fmt.Printf("Error installing dependencies: %v\n", err)
			return
		}

		err = s.CreateDir(sshClient, basePath)
		if err != nil {
			fmt.Printf("Error creating dir: %v\n", err)
			return
		}

		err = s.TransferPermission(sshClient, service.Server.Username, basePath)
		if err != nil {
			fmt.Printf("Error transferring permissions: %v\n", err)
			return
		}

		_, err = s.GitService.CloneRepo(sshClient, service.Git.RepositoryURL, basePath, "Github", workspaceUUID)
		if err != nil {
			fmt.Printf("Error cloning repo: %v\n", err)
			return
		}
	}

	_, err = s.GitService.SwitchBranch(sshClient, basePath, service.Git.Branch)
	if err != nil {
		fmt.Printf("Error switching branch: %v\n", err)
		return
	}

	_, err = s.GitService.Pull(sshClient, basePath)
	if err != nil {
		fmt.Printf("Error pulling repo: %v\n", err)
	}

	var buildPath string = basePath
	if service.Git.SubDirectory != "" {
		buildPath = basePath + "/" + service.Git.SubDirectory
	}

	if !isUpdate {
		err = s.SetupNginx(sshClient, service)
		if err != nil {
			fmt.Printf("Error setting up Nginx: %v\n", err)
			return
		}

		if service.HttpsEnabled {
			err = s.SetupSSL(sshClient, service)
			if err != nil {
				fmt.Printf("Error setting up SSL: %v\n", err)
				return
			}
		}
	}

	err = s.BuildService(sshClient, service, buildPath)
	if err != nil {
		fmt.Printf("Error building service: %v\n", err)
		return
	}

	if service.Type != "static" && service.Type != "frontend" {
		if !isUpdate {
			err = s.SetupSystemd(sshClient, service, buildPath)
			if err != nil {
				fmt.Printf("Error setting up systemd: %v\n", err)
				return
			}
		} else {
			serviceName := fmt.Sprintf("%s-%s-%s.service", service.Project.Name, service.Environment.Name, service.Name)
			_, err = sshClient.RunCommand(fmt.Sprintf("sudo systemctl restart %s", serviceName))
			if err != nil {
				fmt.Printf("Error restarting service: %v\n", err)
				return
			}
		}
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

func (s *deploymentService) BuildService(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string) error {
	logChan := make(chan string)
	imageName := strings.ToLower(fmt.Sprintf("%s-%s-%s", service.Project.Name, service.Environment.Name, service.Name))

	go func() {
		defer close(logChan)

		if service.DockerizeType == "auto" {
			if service.Framework == "node" {
				startCmd := service.StartCommand
				if startCmd == "" {
					startCmd = "npm start"
				}
				dockerfile := fmt.Sprintf(`
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN %s
ENV PORT=%d
EXPOSE %d
CMD %s
`, service.BuildCommand, service.Port, service.Port, startCmd)

				encodedDf := base64.StdEncoding.EncodeToString([]byte(dockerfile))
				writeCmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s/Dockerfile > /dev/null", encodedDf, path)
				if _, err := sshClient.RunCommand(writeCmd); err != nil {
					logChan <- fmt.Sprintf("Error writing Dockerfile: %v", err)
					return
				}
				logChan <- "Auto-generated Node Dockerfile successfully."
			} else if service.Framework == "bun" {
				startCmd := service.StartCommand
				if startCmd == "" {
					startCmd = "bun start"
				}
				dockerfile := fmt.Sprintf(`
FROM oven/bun:alpine
WORKDIR /app
COPY package*.json bun.lockb* ./
RUN bun install
COPY . .
RUN %s
ENV PORT=%d
EXPOSE %d
CMD %s
`, service.BuildCommand, service.Port, service.Port, startCmd)

				encodedDf := base64.StdEncoding.EncodeToString([]byte(dockerfile))
				writeCmd := fmt.Sprintf("echo '%s' | base64 -d | sudo tee %s/Dockerfile > /dev/null", encodedDf, path)
				if _, err := sshClient.RunCommand(writeCmd); err != nil {
					logChan <- fmt.Sprintf("Error writing Dockerfile: %v", err)
					return
				}
				logChan <- "Auto-generated Bun Dockerfile successfully."
			}
		}

		buildCmd := fmt.Sprintf("cd %s && sudo docker build -t %s .", path, imageName)
		logChan <- "Starting docker build process..."
		err := sshClient.RunCommandStream(buildCmd, logChan)
		if err != nil {
			logChan <- fmt.Sprintf("Error running docker build: %v", err)
			return
		}

		if service.Type == "static" || service.Type == "frontend" {
			logChan <- "Extracting built static files for Nginx to serve..."
			extractCmd := fmt.Sprintf(`
			sudo docker create --name extract-%[1]s %[1]s
			sudo docker cp extract-%[1]s:/app/dist %[2]s/dist || sudo docker cp extract-%[1]s:/app/out %[2]s/dist || true
			sudo docker rm -v extract-%[1]s
			`, imageName, path)
			if _, err := sshClient.RunCommand(extractCmd); err != nil {
				logChan <- fmt.Sprintf("Error extracting static files: %v", err)
				return
			}
			logChan <- "Extraction complete!"
		}
	}()

	for log := range logChan {
		fmt.Println(log)
	}

	return nil
}

func (s *deploymentService) SetupSystemd(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO, path string) error {
	serviceName := fmt.Sprintf("%s-%s-%s.service", service.Project.Name, service.Environment.Name, service.Name)
	imageName := strings.ToLower(fmt.Sprintf("%s-%s-%s", service.Project.Name, service.Environment.Name, service.Name))
	serviceFile := fmt.Sprintf("/etc/systemd/system/%s", serviceName)

	config := fmt.Sprintf(`[Unit]
Description=%[1]s service Docker container
Requires=docker.service
After=docker.service

[Service]
Restart=always
RestartSec=10
ExecStartPre=-/usr/bin/docker stop %[2]s
ExecStartPre=-/usr/bin/docker rm %[2]s
ExecStart=/usr/bin/docker run --name %[2]s --rm -p %[3]d:%[3]d %[2]s
ExecStop=/usr/bin/docker stop %[2]s

SyslogIdentifier=%[1]s

[Install]
WantedBy=multi-user.target
`, serviceName, imageName, service.Port)

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
		if ! command -v docker &> /dev/null; then
			curl -fsSL https://get.docker.com -o get-docker.sh
			sudo sh get-docker.sh
			sudo usermod -aG docker $USER
		fi
		sudo docker --version
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
		documentRoot += "/dist"

		config = fmt.Sprintf(`
		server {
			listen 80;
			server_name %s;

			root %s;
			index index.html index.htm;

			location / {
				try_files $uri $uri/ /index.html;
			}
		}
	`, domain, documentRoot)
	} else {
		config = fmt.Sprintf(`
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
	`, domain, fmt.Sprintf("%d", service.Port))
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

func (s *deploymentService) SetupSSL(sshClient SSHClient, service *dtos_service.ServiceDetailsResponseDTO) error {
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
			documentRoot += "/dist"

			config = fmt.Sprintf(`
		server {
			listen 80;
			server_name %s;
			return 301 https://$host$request_uri;
		}

		server {
			listen 443 ssl;
			server_name %s;

			ssl_certificate %s;
			ssl_certificate_key %s;

			root %s;
			index index.html index.htm;

			location / {
				try_files $uri $uri/ /index.html;
			}
		}
	`, service.Domain, service.Domain, certFile, keyFile, documentRoot)
		} else {
			config = fmt.Sprintf(`
		server {
			listen 80;
			server_name %s;
			return 301 https://$host$request_uri;
		}

		server {
			listen 443 ssl;
			server_name %s;

			ssl_certificate %s;
			ssl_certificate_key %s;

			location / {
				proxy_pass http://localhost:%s;

				proxy_http_version 1.1;
				proxy_set_header Upgrade $http_upgrade;
				proxy_set_header Connection "upgrade";
				proxy_set_header Host $host;
				proxy_cache_bypass $http_upgrade;
			}
		}
	`, service.Domain, service.Domain, certFile, keyFile, fmt.Sprintf("%d", service.Port))
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
