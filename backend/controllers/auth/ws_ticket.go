package controllers_auth

import (
	redisclient "backend/redis"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (a *AuthController) GenerateWSTicket(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Generate a random ticket
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate ticket"})
		return
	}
	ticket := hex.EncodeToString(b)

	// Save to Redis with 60s expiration
	// Record userID as string
	err := redisclient.Client.Set(redisclient.Ctx, "ws_ticket:"+ticket, userIDRaw, 60*time.Second).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store ticket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ticket": ticket})
}
