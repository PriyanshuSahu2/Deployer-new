package utils

import (
	"fmt"
	"strings"
	"time"
)

func GenerateUsername(name string) string {
	base := strings.ToLower(strings.ReplaceAll(name, " ", "_"))
	timestamp := time.Now().UnixNano() % 1_000_000_000_000_000_000 
	return fmt.Sprintf("%s_%d", base, timestamp)
}
