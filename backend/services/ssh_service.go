package services

import (
	"bufio"
	"fmt"
	"io"
	"time"

	"golang.org/x/crypto/ssh"
)

type SSHClient interface {
	TestConnection() error
	RunCommand(command string) (string, error)
	RunCommands(commands []string) ([]string, error)
	RunCommandStream(command string, logChan chan string) error
	Close() error
}

type SSHService interface {
	Connect(host string, port int, username string, privateKey []byte) (SSHClient, error)
}

type sshService struct{}

func NewSSHService() SSHService {
	return &sshService{}
}

func (s *sshService) Connect(host string, port int, username string, privateKey []byte) (SSHClient, error) {
	signer, err := ssh.ParsePrivateKey(privateKey)
	if err != nil {
		return nil, err
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
		return nil, err
	}

	return &sshClientImpl{client: client}, nil
}

type sshClientImpl struct {
	client *ssh.Client
}

func (c *sshClientImpl) TestConnection() error {
	session, err := c.client.NewSession()
	if err != nil {
		return err
	}
	defer session.Close()

	return session.Run("echo connected")
}

func (c *sshClientImpl) RunCommand(command string) (string, error) {
	session, err := c.client.NewSession()
	if err != nil {
		return "", err
	}
	defer session.Close()

	output, err := session.CombinedOutput(command)
	return string(output), err
}

func (c *sshClientImpl) RunCommands(commands []string) ([]string, error) {
	var results []string

	for _, cmd := range commands {
		out, err := c.RunCommand(cmd)
		if err != nil {
			return results, err
		}
		results = append(results, out)
	}

	return results, nil
}

func (c *sshClientImpl) Close() error {
	if c.client != nil {
		return c.client.Close()
	}
	return nil
}
func streamOutput(reader io.Reader, logChan chan string) {
	scanner := bufio.NewScanner(reader)

	for scanner.Scan() {
		logChan <- scanner.Text()
	}
}

func (c *sshClientImpl) RunCommandStream(command string, logChan chan string) error {
	session, err := c.client.NewSession()
	if err != nil {
		return err
	}
	defer session.Close()

	stdout, err := session.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := session.StderrPipe()
	if err != nil {
		return err
	}

	if err := session.Start(command); err != nil {
		return err
	}

	go streamOutput(stdout, logChan)
	go streamOutput(stderr, logChan)

	err = session.Wait()

	return err

}
