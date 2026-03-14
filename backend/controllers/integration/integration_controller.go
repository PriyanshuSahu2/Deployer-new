package controllers_integration

import (
	"backend/services"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type IntegrationController struct {
	IntegrationService *services.IntegrationService
}

func NewIntegrationController(integrationService *services.IntegrationService) *IntegrationController {
	return &IntegrationController{
		IntegrationService: integrationService,
	}
}

func (c *IntegrationController) GithubAuthInitiate(ctx *gin.Context) {
	workspaceUUID := ctx.Param("workspaceUUID")

	clientId := os.Getenv("GITHUB_CLIENT_ID")

	redirectUri := os.Getenv("FRONTEND_URL") + "/auth/github/callback"

	stateParam := "workspace_" + workspaceUUID

	githubAuthUrl := "https://github.com/login/oauth/authorize?client_id=" + clientId + "&redirect_uri=" + redirectUri + "&state=" + stateParam + "&scope=repo"

	ctx.JSON(http.StatusOK, gin.H{
		"url": githubAuthUrl,
	})
}

func (c *IntegrationController) GithubAuthCallback(ctx *gin.Context) {
	code := ctx.Query("code")
	state := ctx.Query("state") //here i will send worskapce_workspaceUUID

	if code == "" || state == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing code or state"})
		return
	}

	workspaceUUID := state
	if len(state) > 10 && state[:10] == "workspace_" {
		workspaceUUID = state[10:]
	}

	redirectUri := os.Getenv("FRONTEND_URL") + "/auth/github/callback"

	err := c.IntegrationService.HandleGithubCallback(nil, workspaceUUID, code, state, redirectUri)
	if err != nil {
		ctx.Redirect(http.StatusTemporaryRedirect, os.Getenv("FRONTEND_URL")+"/app/"+workspaceUUID+"/integrations?error="+err.Error())
		return
	}

	ctx.Redirect(http.StatusTemporaryRedirect, os.Getenv("FRONTEND_URL")+"/app/"+workspaceUUID+"/integrations?success=true")
}

func (c *IntegrationController) GetWorkspaceIntegrations(ctx *gin.Context) {
	workspaceUUID := ctx.Param("workspaceUUID")

	integrations, err := c.IntegrationService.GetWorkspaceIntegrations(nil, workspaceUUID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"integrations": integrations})
}

func (c *IntegrationController) DisconnectIntegration(ctx *gin.Context) {
	workspaceUUID := ctx.Param("workspaceUUID")
	provider := ctx.Param("provider")

	if provider == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing provider"})
		return
	}

	err := c.IntegrationService.DeleteIntegration(nil, workspaceUUID, provider)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Integration disconnected successfully"})
}
