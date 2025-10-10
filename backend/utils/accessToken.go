package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateAccessToken(payload map[string]interface{}) (string, error) {
	claims := jwt.MapClaims(payload)
	claims["exp"] = time.Now().Add(15 * time.Minute).Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(os.Getenv("ACCESS_SECRET_KEY")))
	return accessToken, err
}

func GenerateRefreshToken(payload map[string]interface{}) (string, error) {
	claims := jwt.MapClaims(payload)
	claims["exp"] = time.Now().Add(1 * 24 * time.Hour).Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	refreshToken, err := token.SignedString([]byte(os.Getenv("REFRESH_SECRET_KEY")))
	return refreshToken, err
}

func ValidateToken(tokenString string, jwtSecret string) (map[string]interface{}, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			print("unexpected signing method")
			return nil, errors.New("unexpected signing method")
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	// Extract claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil // return whole map
	}

	return nil, errors.New("invalid token")
}
