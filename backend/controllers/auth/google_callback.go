package controllers_auth

import (
	"backend/db"
	dtos_oauth "backend/dtos/oauth"
	models_auth "backend/models/auth"
	"backend/utils"
	"bytes"
	"encoding/json"
	"errors"

	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (a *AuthController) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")

	if code == "" || state == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authentication failed"})
		return
	}

	tokenResp, err := exchangeCodeForToken(code)
	if err != nil {
		print(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get access token"})
		return
	}

	userProfile, err := getGoogleUserProfile(tokenResp.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user profile"})
		return
	}

	var foundUser models_auth.User
	result := db.DB.Where("email = ?", userProfile.Email).First(&foundUser)

	if result.Error == nil {
		// User exists, generate tokens
		payload := map[string]interface{}{"id": foundUser.ID}
		accessToken, _ := utils.GenerateAccessToken(payload)
		refreshToken, _ := utils.GenerateRefreshToken(payload)

		c.SetCookie("refresh_token", refreshToken, 7*24*60*60, "/auth/refresh-token", "", false, true)
		c.SetCookie("access_token", accessToken, 7*24*60*60, "/", "", false, true)
		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"user":    foundUser.ID,
		})
		return
	} else if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Step 4: User doesn’t exist → create new user
	newUser := models_auth.User{
		Name:     userProfile.Name,
		Username: utils.GenerateUsername(userProfile.Name), // generate unique username
		Email:    userProfile.Email,
	}

	createResult := db.DB.Create(&newUser)
	if createResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": createResult.Error.Error()})
		return
	}

	payload := map[string]interface{}{"id": newUser.ID}
	accessToken, _ := utils.GenerateAccessToken(payload)
	refreshToken, _ := utils.GenerateRefreshToken(payload)

	c.SetCookie("refresh_token", refreshToken, 7*24*60*60, "/auth/refresh-token", "", false, true)
	c.SetCookie("access_token", accessToken, 7*24*60*60, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{
		"message": "Signup successful",
		"user":    newUser.ID,
	})
}

func exchangeCodeForToken(code string) (*dtos_oauth.TokenResponse, error) {
	body := map[string]string{
		"code":          code,
		"client_id":     os.Getenv("GOOGLE_CLIENT_ID"),
		"client_secret": os.Getenv("GOOGLE_CLIENT_SECRET"),
		"redirect_uri":  os.Getenv("GOOGLE_CALLBACK_URL"),
		"grant_type":    "authorization_code",
	}

	jsonBody, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", "https://oauth2.googleapis.com/token", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	resultBody, _ := io.ReadAll(resp.Body)
	var tokenResp dtos_oauth.TokenResponse
	if err := json.Unmarshal(resultBody, &tokenResp); err != nil {
		return nil, err
	}

	if tokenResp.AccessToken == "" {
		return nil, errors.New("no access token received")
	}

	return &tokenResp, nil
}

func getGoogleUserProfile(accessToken string) (*dtos_oauth.GoogleUserProfile, error) {
	req, _ := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v3/userinfo", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	resultBody, _ := io.ReadAll(resp.Body)
	var profile dtos_oauth.GoogleUserProfile
	if err := json.Unmarshal(resultBody, &profile); err != nil {
		return nil, err
	}

	return &profile, nil
}
