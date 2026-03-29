package routes

import (
	controller_webhook "backend/controllers/webhook"
	"github.com/gin-gonic/gin"
)

func WebhookRoutes(r *gin.Engine, webhookController *controller_webhook.WebhookController) {
	webhooks := r.Group("/webhooks")
	{
		webhooks.POST("/github", webhookController.HandleGitHubWebhook)
	}
}
