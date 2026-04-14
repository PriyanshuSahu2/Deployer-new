package utils

import (
	"net/url"
	"os"
	"strings"
)

func BuildFrontendVerificationLink(token string) string {
	frontendURL := strings.TrimRight(os.Getenv("FRONTEND_URL"), "/")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	return frontendURL + "/auth/verify-email?token=" + url.QueryEscape(token)
}
