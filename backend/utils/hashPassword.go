package utils

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

const BcryptCost = 12

func HashPassword(password string) (string, error) {
	if password == "" {
		return "", errors.New("password is empty")
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)

	if err != nil {
		return "", err
	}

	return string(hashed), nil
}

func CheckPassword(password string, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
