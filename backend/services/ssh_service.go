package services

import (
	"fmt"
	"time"

	"golang.org/x/crypto/ssh"
)

type SSHService interface {
	Connect(host string, port int, username string, privateKey []byte) error
	TestConnection() error
	RunCommand(command string) (string, error)
	RunCommands(commands []string) ([]string, error)
	Close() error
}

type sshService struct {
	client *ssh.Client
}

func NewSSHService() SSHService {
	return &sshService{}
}

func (s *sshService) Connect(host string, port int, username string, privateKey []byte) error {
	signer, err := ssh.ParsePrivateKey(privateKey)
	if err != nil {
		return err
	}

	config := &ssh.ClientConfig{
		User: username,
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(signer),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         5 * time.Second,
	}

	addr := fmt.Sprintf("%s:%d", host, port)

	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return err
	}

	s.client = client
	return nil
}

func (s *sshService) TestConnection() error {
	session, err := s.client.NewSession()
	if err != nil {
		return err
	}
	defer session.Close()

	return session.Run("echo connected")
}

func (s *sshService) RunCommand(command string) (string, error) {
	session, err := s.client.NewSession()
	if err != nil {
		return "", err
	}
	defer session.Close()

	output, err := session.CombinedOutput(command)
	return string(output), err
}

func (s *sshService) RunCommands(commands []string) ([]string, error) {
	var results []string

	for _, cmd := range commands {
		out, err := s.RunCommand(cmd)
		if err != nil {
			return results, err
		}
		results = append(results, out)
	}

	return results, nil
}
func (s *sshService) Close() error {
	if s.client != nil {
		return s.client.Close()
	}
	return nil
}
