package routes

import (
	controllers_projects "backend/controllers/projects"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func ProjectRoute(r *gin.Engine) {
	project := r.Group("/project", middleware.ValidateRequest())
	{
		project.POST("/", controllers_projects.CreateProject)
		project.GET("/github/repo", controllers_projects.GetGithubRepos)
	}
}
