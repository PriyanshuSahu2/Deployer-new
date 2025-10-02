package controllers_auth

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func GithubCallback(c *gin.Context) {
	state := c.Query("state")
	code := c.Query("code")
	if state == "" || code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authentication Failed"})
	}
	body := map[string]string{
		"client_id":     os.Getenv(""),
		"client_secret": os.Getenv(""),
		"code":          code,
		"redirect_uri":  os.Getenv(""),
		"state":         state,
	}
	jsonBody, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Request creation failed"})
		return
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Request failed"})
		return
	}

	defer resp.Body.Close()

	resultBody, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	if err := json.Unmarshal(resultBody, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse token"})
		return
	}
	accessToken, ok := result["access_token"].(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No access token returned"})
		return
	}
}
