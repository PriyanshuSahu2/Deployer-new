package controllers_auth

import (
	"backend/utils"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func RefreshController(c *gin.Context) {
	token, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cookie 'my_cookie' not found"})
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
	c.SetCookie(
		"refresh_token",
		refresh_token,
		7*24*60*60,
		"/",
		"",
		false,
		true,
	)
	c.JSON(http.StatusOK, gin.H{"access_token": access_token})
}
