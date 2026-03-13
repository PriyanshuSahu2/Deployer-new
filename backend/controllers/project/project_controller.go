package controller_project

import (
	"net/http"

	dtos_project "backend/dtos/project"
	"backend/services"

	"github.com/gin-gonic/gin"
)

type ProjectController struct {
	Service *services.ProjectService
}

func NewProjectController(service *services.ProjectService) *ProjectController {
	return &ProjectController{Service: service}
}

func (pc *ProjectController) CreateProject(c *gin.Context) {
	var body dtos_project.CreateProjectDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := pc.Service.CreateProject(nil, c.MustGet("userID").(uint), c.Param("workspaceUUID"), body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Project Created Successfully"})
}

func (pc *ProjectController) UpdateProject(c *gin.Context) {
	var body dtos_project.UpdateProjectDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	body.UUID = c.Param("uuid")

	if err := pc.Service.UpdateProject(nil, c.MustGet("userID").(uint), body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project Updated Successfully"})
}

func (pc *ProjectController) ListProjects(c *gin.Context) {
	projects, err := pc.Service.ListProjects(nil, c.MustGet("userID").(uint), c.Param("workspaceUUID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func (pc *ProjectController) GetProjectDetails(c *gin.Context) {
	project, err := pc.Service.GetProjectDetails(nil, c.MustGet("userID").(uint), c.Param("uuid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, project)
}

func (pc *ProjectController) DeleteProject(c *gin.Context) {
	if err := pc.Service.DeleteProject(nil, c.MustGet("userID").(uint), c.Param("uuid")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project Deleted Successfully"})
}
