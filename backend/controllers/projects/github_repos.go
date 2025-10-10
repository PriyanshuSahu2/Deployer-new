package controllers_projects

import (
	"backend/db"
	dtos_oauth "backend/dtos/oauth"
	models_oauth "backend/models/oauth"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUserRepositories(githubToken string, username string) ([]dtos_oauth.GithubRepo, error) {
	var results []dtos_oauth.GithubRepo
	client := &http.Client{}
	req, err := http.NewRequest(
		"GET",
		fmt.Sprintf("https://api.github.com/users/%s/repos", username),
		nil,
	)
	if err != nil {
		return nil, errors.New("failed to create Req")
	}
	req.Header.Set("Authorization", "Bearer "+githubToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.New("request failed")
	}

	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		return nil, errors.New("failed to parse token")
	}
	return results, nil
}
func GetGithubRepos(c *gin.Context) {
	var userToken models_oauth.OAuthToken
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found"})
		return
	}

	if err := db.DB.Where("user_id = ?", userID).First(&userToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch GitHub token"})
		return
	}

	if userToken.AccessToken == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "GitHub token not found. Please authorize GitHub."})
		return
	}

	repos, err := GetUserRepositories(userToken.AccessToken, userToken.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch GitHub repositories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"repos": repos,
	})
}
