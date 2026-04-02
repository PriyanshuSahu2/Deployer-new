package services

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

type LogStreamer struct {
	ServiceRepo    *ServiceService
	SSHService     SSHService
}

func NewLogStreamer(serviceRepo *ServiceService, sshService SSHService) *LogStreamer {
	return &LogStreamer{
		ServiceRepo: serviceRepo,
		SSHService:  sshService,
	}
}

func (s *LogStreamer) StreamRuntimeLogs(ctx context.Context, ws *websocket.Conn, serviceUUID string) error {
	service, err := s.ServiceRepo.GetServiceDetails(nil, serviceUUID)
	if err != nil {
		return err
	}

	sshClient, err := s.SSHService.Connect(
		service.Server.Host,
		service.Server.Port,
		service.Server.Username,
		[]byte(service.Server.PassKey),
	)
	if err != nil {
		return err
	}
	defer sshClient.Close()

	var cmd string
	imageName := strings.ToLower(fmt.Sprintf("%s-%s-%s", service.Project.Name, service.Environment.Name, service.Name))

	if service.DockerizeType == "compose" {
		basePath := "/var/www/" + service.Project.Name + "/" + service.Environment.Name + "/" + service.Name
		if service.Git != nil && service.Git.SubDirectory != "" {
			basePath += "/" + service.Git.SubDirectory
		}
		cmd = fmt.Sprintf("cd %s && sudo docker compose logs -f --tail=100 --no-log-prefix --no-color", basePath)
	} else {
		cmd = fmt.Sprintf("sudo docker logs -f --tail 100 %s 2>&1", imageName)
	}

	logChan := make(chan string)
	errChan := make(chan error, 1)

	go func() {
		errChan <- sshClient.RunCommandStream(cmd, logChan)
	}()

	for {
		select {
		case <-ctx.Done():
			return nil
		case log, ok := <-logChan:
			if !ok {
				return nil
			}
			if err := ws.WriteJSON(map[string]string{"log": log}); err != nil {
				return err
			}
		case err := <-errChan:
			if err != nil {
				ws.WriteJSON(map[string]string{"log": fmt.Sprintf("System: %v", err)})
				// Don't exit immediately, wait for context or retry?
				// For now, let's just wait for context to avoid loop
				<-ctx.Done()
				return nil
			}
			return nil
		}
	}
}

func (s *LogStreamer) StreamDeploymentLogs(ctx context.Context, ws *websocket.Conn, serviceUUID string) error {
	logFilePath := fmt.Sprintf("logs/deployments/%s.log", serviceUUID)

	// Wait for file to exist if it doesn't
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	// Initial check
	for i := 0; i < 5; i++ {
		if _, err := os.Stat(logFilePath); err == nil {
			break
		}
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			continue
		}
	}

	file, err := os.Open(logFilePath)
	if err != nil {
		// If still doesn't exist, just wait or return nil instead of erroring
		// This prevents the WS from closing and reconnecting constantly
		ws.WriteJSON(map[string]string{"log": "Waiting for deployment logs..."})
		
		// Wait for file or context cancellation
		for {
			select {
			case <-ctx.Done():
				return nil
			case <-ticker.C:
				if _, err := os.Stat(logFilePath); err == nil {
					file, err = os.Open(logFilePath)
					if err == nil {
						goto FILE_OPENED
					}
				}
			}
		}
	}

FILE_OPENED:
	defer file.Close()
	reader := bufio.NewReader(file)
	for {
		select {
		case <-ctx.Done():
			fmt.Printf("LogStreamer: Context done for %s\n", serviceUUID)
			return nil
		default:
			line, err := reader.ReadString('\n')
			// Process data even if EOF
			if line != "" {
				if err := ws.WriteJSON(map[string]string{"log": strings.TrimSuffix(line, "\n")}); err != nil {
					return err
				}
			}
			
			if err != nil {
				if err == io.EOF {
					// Wait for more data
					time.Sleep(500 * time.Millisecond)
					continue
				}
				fmt.Printf("LogStreamer error for %s: %v\n", serviceUUID, err)
				return err
			}
		}
	}
}
