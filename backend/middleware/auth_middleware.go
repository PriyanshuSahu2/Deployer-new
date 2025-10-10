package middleware

import (
	"backend/utils"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func ValidateRequest() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Optional: exclude routes
		// url := c.Request.URL.Path
		// excluded := []string{"/login", "/register", "refresh-token", "/swagger"}
		// for _, v := range excluded {
		// 	if strings.Contains(url, v) {
		// 		c.Next()
		// 		return
		// 	}
		// }

		authHeaders := c.Request.Header["Authorization"]
		if len(authHeaders) == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token Not Found"})
			c.Abort()
			return
		}

		access_token := strings.Split(authHeaders[0], " ")[1]
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

		var userID string

		switch v := rawID.(type) {
		case float64:
			// Convert float64 to string
			userID = fmt.Sprintf("%.0f", v)
		case string:
			userID = v
		default:
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user_id type in token"})
			c.Abort()
			return
		}

		// Set user id in header/context
		c.Set("user_id", userID)

		c.Next()
	}
}
