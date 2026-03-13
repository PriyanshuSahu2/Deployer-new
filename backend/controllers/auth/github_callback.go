package controllers_auth

import (
	"backend/db"
	dtos_oauth "backend/dtos/oauth"
	models_auth "backend/models/auth"
	models_oauth "backend/models/oauth"
	"backend/utils"
	utils_array "backend/utils/array_utils"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func getGithubUserProfile(accessToken string) (dtos_oauth.GithubUserProfile, error) {
	var result dtos_oauth.GithubUserProfile
	client := &http.Client{}

	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return result, errors.New("request creation failed")

	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")
	resp, err := client.Do(req)
	if err != nil {
		return result, errors.New("request failed")
	}

	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, errors.New("failed to parse token")
	}

	return result, nil
}

func getGithubUserEmail(accessToken string) (dtos_oauth.GitHubEmail, error) {
	var result dtos_oauth.GitHubEmail
	client := &http.Client{}

	req, err := http.NewRequest("GET", "https://api.github.com/user/emails", nil)
	if err != nil {
		return result, errors.New("request creation failed")

	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")
	resp, err := client.Do(req)
	if err != nil {
		return result, errors.New("request failed")
	}

	defer resp.Body.Close()
	var respBody []dtos_oauth.GitHubEmail
	if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
		return result, errors.New("failed to parse token")
	}
	found_email, _ := utils_array.Find(respBody, func(i dtos_oauth.GitHubEmail) bool {
		return i.Primary
	})

	return found_email, nil
}
func generateGithubToken(state string, code string) (string, error) {
	body := map[string]string{
		"client_id":     os.Getenv("GITHUB_CLIENT_ID"),
		"client_secret": os.Getenv("GITHUB_CLIENT_SECRET"),
		"code":          code,
		"redirect_uri":  os.Getenv("GITHUB_CALLBACK_URL"),
		"state":         state,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", errors.New("failed to encode request body")
	}

	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", errors.New("request creation failed")
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", errors.New("request failed")
	}
	defer resp.Body.Close()

	resultBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("failed to read response body")
	}

	var result map[string]interface{}
	if err := json.Unmarshal(resultBody, &result); err != nil {
		return "", errors.New("failed to parse response")
	}

	githubAccessToken, ok := result["access_token"].(string)
	if !ok || githubAccessToken == "" {
		return "", errors.New("no access token returned")
	}

	return githubAccessToken, nil
}

func (a *AuthController) GithubCallback(c *gin.Context) {
	state := c.Query("state")
	code := c.Query("code")
	if state == "" || code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authentication Failed"})
		return
	}
	githubAccessToken, err := generateGithubToken(state, code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	userProfile, err := getGithubUserProfile(githubAccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error Retrieving user profile"})
		return
	}

	emailDetails, err := getGithubUserEmail(githubAccessToken)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error Retrieving user email"})
		return
	}

	var foundUser models_auth.User
	foundUserResult := db.DB.Where("email = ?", emailDetails.Email).First(&foundUser)

	if foundUserResult.Error == nil {
		payload := map[string]interface{}{
			"id": foundUser.ID,
		}
		newAccessToken := models_oauth.OAuthToken{UserID: uint(foundUser.ID), Username: userProfile.Login, Provider: "GITHUB", AccessToken: githubAccessToken, TokenType: "REPO", Scope: "REPO"}
		db.DB.Where("user_id = ? AND provider = ? AND token_type = ?", foundUser.ID, "GITHUB", "REPO").
			Delete(&models_oauth.OAuthToken{})
		if err := db.DB.Create(&newAccessToken).Error; err != nil {
			fmt.Println("Error inserting GitHub token:", err)
		}
		access_token, err := utils.GenerateAccessToken(payload)

		if err != nil {
			fmt.Print("Error Generating Access Token", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went Wrong!. Please Try After sometime"})
			return
		}

		refresh_token, err := utils.GenerateRefreshToken(payload)
		if err != nil {
			fmt.Print("Error Generating Refresh Token", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went Wrong!. Please Try After sometime"})
			return
		}

		c.SetCookie(
			"refresh_token",
			refresh_token,
			7*24*60*60,
			"/auth/refresh-token",
			"",
			false,
			true,
		)
		c.SetCookie(
			"access_token",
			access_token,
			7*24*60*60,
			"/",
			"",
			false,
			true,
		)

		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"user":    foundUser.ID,
		})
		return
	} else if !errors.Is(foundUserResult.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": foundUserResult.Error.Error()})
		return
	}
	providerID := fmt.Sprint(userProfile.ID)

	newUser := models_auth.User{
		Name:     userProfile.Name,
		Username: utils.GenerateUsername(userProfile.Name),
		Email:    emailDetails.Email,
		GithubID: &providerID,
	}

	createResult := db.DB.Create(&newUser)
	if createResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": createResult.Error.Error()})
		return
	}

	newAccessToken := models_oauth.OAuthToken{UserID: uint(newUser.ID), Username: userProfile.Login, Provider: "GITHUB", AccessToken: githubAccessToken, TokenType: "REPO", Scope: "REPO"}
	db.DB.Create(newAccessToken)
	payload := map[string]interface{}{
		"id": newUser.ID,
	}
	access_token, err := utils.GenerateAccessToken(payload)
	if err != nil {
		fmt.Print("Error Generating Access Token", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went Wrong!. Please Try After sometime"})
		return
	}

	refresh_token, err := utils.GenerateRefreshToken(payload)
	if err != nil {
		fmt.Print("Error Generating Refresh Token", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went Wrong!. Please Try After sometime"})
		return
	}

	c.SetCookie(
		"refresh_token",
		refresh_token,
		7*24*60*60,
		"/auth/refresh-token",
		"",
		false,
		true,
	)
	c.SetCookie(
		"access_token",
		access_token,
		7*24*60*60,
		"/",
		"",
		false,
		true,
	)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    newUser.ID,
	})

}
