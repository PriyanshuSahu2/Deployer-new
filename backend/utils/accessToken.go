package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateAccessToken(payload map[string]interface{}) (string, error) {
	claims := jwt.MapClaims(payload)
	claims["exp"] = time.Now().Add(15 * time.Minute).Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString(os.Getenv("ACCESS_SECRET_KEY"))
	return accessToken, err
}

func GenerateRefreshToken(payload map[string]interface{}) (string, error) {
	claims := jwt.MapClaims(payload)
	claims["exp"] = time.Now().Add(1 * 24 * time.Hour).Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	refreshToken, err := token.SignedString(os.Getenv("REFRESH_SECRET_KEY"))
	return refreshToken, err
}
