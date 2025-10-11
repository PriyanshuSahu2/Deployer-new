package controllers_projects

import (
	"backend/db"
	dtos_project "backend/dtos/project"
	models_project "backend/models/project"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/ssh"
)

func connectToSSH(host string, port string, username string, privateKey string) {
	signer, err := ssh.ParsePrivateKey([]byte(privateKey))
	if err != nil {
		log.Fatalf("unable to parse private key: %v", err)
	}

	config := &ssh.ClientConfig{
		User: username,
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(signer),
		},

		HostKeyCallback: ssh.InsecureIgnoreHostKey(), //TODO for testing; don't use in production

	}
	client, err := ssh.Dial("tcp", host+":"+port, config)
	if err != nil {
		log.Fatalf("unable to parse private key: %v", err)
	}
	defer client.Close()

	print(client)
}
func CreateProject(c *gin.Context) {
	var newProjectBody dtos_project.ProjectCreation

	if err := c.ShouldBindJSON(&newProjectBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := db.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	projectPayload := models_project.Project{
		UserID:      newProjectBody.UserID,
		ProjectType: models_project.ProjectType(newProjectBody.ProjectType),
		Status:      "Pending",
	}
	if err := tx.Create(&projectPayload).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if strings.ToLower(newProjectBody.ProjectType) == "github" && newProjectBody.ProviderConfig != nil {
		providerPayload := models_project.ProjectProviderConfig{
			ProjectID:   projectPayload.ID,
			RepoLink:    newProjectBody.ProviderConfig.RepoLink,
			Branch:      newProjectBody.ProviderConfig.Branch,
			AccessToken: newProjectBody.ProviderConfig.AccessToken,
			SSHKey:      newProjectBody.ProviderConfig.SSHKey,
		}
		if err := tx.Create(&providerPayload).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if strings.ToLower(newProjectBody.ProjectType) == "zip" && newProjectBody.ZIPConfig != nil {
		zipPayload := models_project.ZIPProjectConfig{
			ProjectID: projectPayload.ID,
			FilePath:  newProjectBody.ZIPConfig.FilePath,
		}
		if err := tx.Create(&zipPayload).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if newProjectBody.ProjectConfig != nil {
		buildCommandsJSON, _ := json.Marshal(newProjectBody.ProjectConfig.BuildCommands)
		runCommandsJSON, _ := json.Marshal(newProjectBody.ProjectConfig.RunCommands)
		environmentJSON, _ := json.Marshal(newProjectBody.ProjectConfig.Environment)

		projectConfigPayload := models_project.ProjectConfig{
			ProjectID:       projectPayload.ID,
			BuildPath:       newProjectBody.ProjectConfig.BuildPath,
			BuildCommands:   string(buildCommandsJSON),
			RunCommands:     string(runCommandsJSON),
			Environment:     string(environmentJSON),
			Port:            newProjectBody.ProjectConfig.Port,
			AutoDeploy:      newProjectBody.ProjectConfig.AutoDeploy,
			LastBuildStatus: "pending",
		}

		if err := tx.Create(&projectConfigPayload).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	// 5️⃣ Create DeploymentConfig if provided
	if newProjectBody.DeploymentConfig != nil {
		deployDTO := newProjectBody.DeploymentConfig
		deployPayload := models_project.DeploymentConfig{
			ProjectID: projectPayload.ID,
			Type:      deployDTO.Type,
		}

		if err := tx.Create(&deployPayload).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// SSH deployment
		if deployDTO.Type == "ssh" && deployDTO.SSHConfig != nil {
			sshPayload := models_project.SSHDeploymentConfig{
				DeploymentConfigID: deployPayload.ID,
				Host:               deployDTO.SSHConfig.Host,
				Port:               deployDTO.SSHConfig.Port,
				Username:           deployDTO.SSHConfig.Username,
				PrivateKey:         deployDTO.SSHConfig.PrivateKey,
				Passphrase:         deployDTO.SSHConfig.Passphrase,
			}
			if err := tx.Create(&sshPayload).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		// Token deployment
		if deployDTO.Type == "token" && deployDTO.TokenConfig != nil {
			tokenPayload := models_project.TokenDeploymentConfig{
				DeploymentConfigID: deployPayload.ID,
				Token:              deployDTO.TokenConfig.Token,
				APIURL:             deployDTO.TokenConfig.APIURL,
				Scopes:             deployDTO.TokenConfig.Scopes,
			}
			if err := tx.Create(&tokenPayload).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Project created successfully",
		"project_id": projectPayload.ID,
	})
}
