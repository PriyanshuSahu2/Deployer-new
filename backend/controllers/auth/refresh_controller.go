package controllers_auth

import (
	"backend/utils"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func (a *AuthController) RefreshController(c *gin.Context) {
	token, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token cookie not found"})
		return
	}
	print(token)
	payload, err := utils.ValidateToken(token, os.Getenv("REFRESH_SECRET_KEY"))
	if err != nil {
		print(err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token Expired"})
		return
	}
	access_token, err := utils.GenerateAccessToken(payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Something Went Wrong Generating Access token"})
		return
	}
	refresh_token, err := utils.GenerateRefreshToken(payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Something Went Wrong Generating Refresh token"})
		return
	}
	domain := os.Getenv("COOKIE_DOMAIN")
	if domain == "" {
		domain = ".myapico.live"
	}

	c.SetCookie(
		"access_token",
		access_token,
		7*24*60*60,
		"/",
		domain,
		true,
		true,
	)
	c.SetCookie(
		"refresh_token",
		refresh_token,
		7*24*60*60,
		"/auth/refresh-token",
		domain,
		true,
		true,
	)
	c.JSON(http.StatusOK, gin.H{"access_token": access_token})
}
