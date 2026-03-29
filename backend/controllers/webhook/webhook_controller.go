package controller_webhook

import (
	"backend/services"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type WebhookController struct {
	Service *services.ServiceService
}

func NewWebhookController(service *services.ServiceService) *WebhookController {
	return &WebhookController{Service: service}
}

type GitHubWebhookPayload struct {
	Ref        string `json:"ref"`
	Repository struct {
		FullName string `json:"full_name"`
		HTMLURL  string `json:"html_url"`
		SSHURL   string `json:"ssh_url"`
		CloneURL string `json:"clone_url"`
	} `json:"repository"`
}

func (c *WebhookController) HandleGitHubWebhook(ctx *gin.Context) {
	var payload GitHubWebhookPayload
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		fmt.Printf("Webhook parse error: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	branch := strings.TrimPrefix(payload.Ref, "refs/heads/")

	full_name := payload.Repository.FullName

	go c.Service.ProcessGitHubWebhook(full_name, branch)

	ctx.JSON(http.StatusOK, gin.H{"message": "Webhook processed"})
}
