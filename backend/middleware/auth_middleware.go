package middleware

import (
	"backend/utils"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func ValidateRequest() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Optional: exclude routes
		// url := c.Request.URL.Path
		// excluded := []string{"/login", "/register", "refresh-token", "/workspace-invites/", "/swagger"}
		// for _, v := range excluded {
		// 	if strings.HasPrefix(url, v) {
		// 		c.Next()
		// 		return
		// 	}
		// }

		authHeaders, err := c.Cookie("access_token")
		if err != nil || authHeaders == "" {
			authHeaders = c.Query("token")
		}

		if authHeaders == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token Not Found"})
			c.Abort()
			return
		}

		access_token := authHeaders
		if access_token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token Not Found"})
			c.Abort()
			return
		}

		payload, err := utils.ValidateToken(access_token, os.Getenv("ACCESS_SECRET_KEY"))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		rawID, ok := payload["id"]
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in token"})
			c.Abort()
			return
		}

		var userID uint

		switch v := rawID.(type) {
		case float64:
			// Convert float64 to uint
			userID = uint(v)
		case string:
			// Parse string to uint
			var tempID uint64
			if _, err := fmt.Sscanf(v, "%d", &tempID); err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user_id format in token"})
				c.Abort()
				return
			}
			userID = uint(tempID)
		default:
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user_id type in token"})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}
