package controllers_auth

import (
	"backend/utils"
	"testing"
)

func strPtr(value string) *string {
	return &value
}

func TestValidateProfileUpdateRequest(t *testing.T) {
	tests := []struct {
		name    string
		input   UpdateProfileDTO
		wantErr bool
	}{
		{
			name:    "rejects empty payload",
			input:   UpdateProfileDTO{},
			wantErr: true,
		},
		{
			name: "rejects blank provided name",
			input: UpdateProfileDTO{
				Name: strPtr("   "),
			},
			wantErr: true,
		},
		{
			name: "rejects invalid username characters",
			input: UpdateProfileDTO{
				Username: strPtr("bad user"),
			},
			wantErr: true,
		},
		{
			name: "accepts trimmed valid fields",
			input: UpdateProfileDTO{
				Name:     strPtr("  Jane Doe  "),
				Username: strPtr("jane_doe"),
			},
			wantErr: false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			_, err := validateProfileUpdateRequest(tc.input)
			if tc.wantErr && err == nil {
				t.Fatalf("expected error but got nil")
			}
			if !tc.wantErr && err != nil {
				t.Fatalf("expected nil error but got %v", err)
			}
		})
	}
}

func TestValidatePasswordChangeRequest(t *testing.T) {
	existingHash, err := utils.HashPassword("current-password")
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	tests := []struct {
		name         string
		input        ChangePasswordDTO
		existingHash string
		wantErr      bool
	}{
		{
			name: "requires current password when one already exists",
			input: ChangePasswordDTO{
				NewPassword: "new-password-123",
			},
			existingHash: existingHash,
			wantErr:      true,
		},
		{
			name: "rejects wrong current password",
			input: ChangePasswordDTO{
				CurrentPassword: "wrong-password",
				NewPassword:     "new-password-123",
			},
			existingHash: existingHash,
			wantErr:      true,
		},
		{
			name: "rejects reusing the current password",
			input: ChangePasswordDTO{
				CurrentPassword: "current-password",
				NewPassword:     "current-password",
			},
			existingHash: existingHash,
			wantErr:      true,
		},
		{
			name: "allows setting a password for oauth-only accounts",
			input: ChangePasswordDTO{
				NewPassword: "brand-new-password",
			},
			existingHash: "",
			wantErr:      false,
		},
		{
			name: "accepts valid current and new password",
			input: ChangePasswordDTO{
				CurrentPassword: "current-password",
				NewPassword:     "new-password-123",
			},
			existingHash: existingHash,
			wantErr:      false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := validatePasswordChangeRequest(tc.input, tc.existingHash)
			if tc.wantErr && err == nil {
				t.Fatalf("expected error but got nil")
			}
			if !tc.wantErr && err != nil {
				t.Fatalf("expected nil error but got %v", err)
			}
		})
	}
}
