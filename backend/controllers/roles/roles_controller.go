package roles_controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateRole(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "CreateRole"})
}
