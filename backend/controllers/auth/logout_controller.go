package controllers_auth

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// Logout godoc
// @Summary Logout user
// @Description Clears the authentication cookies
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]string
// @Router /auth/logout [post]
func (a *AuthController) Logout(c *gin.Context) {
	domain := os.Getenv("COOKIE_DOMAIN")
	if domain == "" {
		domain = ".myapico.live"
	}

	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		domain,
		true,
		true,
	)
	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/",
		domain,
		true,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}
