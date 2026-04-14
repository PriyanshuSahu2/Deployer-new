//go:build ignore

// generate_user.go — Bootstrap script: creates a default admin user, seeds
// system roles (Owner / Manager / Viewer), grants Owner all permissions,
// and creates the user as already email-verified.
//
// Order of operations:
//   1. AutoMigrate all tables
//   2. Duplicate-check the user credentials
//   3. Create the user  ← must come first so roles can reference created_by_id
//   4. Seed system roles (Owner, Manager, Viewer) using the new user as creator
//      (idempotent — safe to re-run; existing roles are skipped)
//   5. Grant Owner role every permission in the permissions table (mirrors
//      grant_owner_all_permissions.sql — idempotent upsert)
//   6. Create default workspace
//   7. Add user as workspace member with Owner role
//
// Usage (run from the backend/ directory):
//
//	go run scripts/generate_user.go
//
// Or override credentials via flags:
//
//	go run scripts/generate_user.go -username=alice -email=alice@example.com -password=secret

package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"backend/db"
	models_auth "backend/models/auth"
	models_base "backend/models/base"
	models_oauth "backend/models/oauth"
	models_permission "backend/models/permission"
	models_project "backend/models/project"
	models_role "backend/models/role"
	models_role_permission "backend/models/role_permission"
	models_server "backend/models/server"
	models_service "backend/models/service"
	models_workspace "backend/models/workspace"
	"backend/utils"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func init() {
	_ = godotenv.Load()
}

var systemRoles = []struct {
	Name        string
	Description string
}{
	{"Owner", "Full access — all permissions granted automatically"},
	{"Manager", "Administrative access with limited destructive actions"},
	{"Viewer", "Read-only access across the workspace"},
}

func main() {
	// ── CLI flags (fall back to env values) ──────────────────────────────────
	argUsername := flag.String("username", os.Getenv("DEFAULT_UN"), "Username (env: DEFAULT_UN)")
	argEmail := flag.String("email", os.Getenv("DEFAULT_EMAIL"), "Email (env: DEFAULT_EMAIL)")
	argPassword := flag.String("password", os.Getenv("DEFAULT_PASS"), "Password (env: DEFAULT_PASS)")
	argName := flag.String("name", os.Getenv("DEFAULT_NAME"), "Display name (env: DEFAULT_NAME)")
	flag.Parse()

	if *argUsername == "" || *argEmail == "" || *argPassword == "" {
		fmt.Println("Usage: go run scripts/generate_user.go [flags]")
		fmt.Println("       Or set DEFAULT_UN / DEFAULT_EMAIL / DEFAULT_PASS in .env")
		flag.PrintDefaults()
		os.Exit(1)
	}
	if *argName == "" {
		*argName = *argUsername
	}

	// ── 1. Connect & AutoMigrate ─────────────────────────────────────────────
	fmt.Println("📦  Connecting to database…")
	db.ConnectToDB()

	fmt.Println("🔄  Running migrations…")
	if err := db.DB.AutoMigrate(
		&models_auth.User{},
		&models_oauth.OAuthToken{},
		&models_auth.OTP{},
		&models_workspace.Workspace{},
		&models_workspace.WorkspaceMember{},
		&models_permission.Permission{},
		&models_project.Project{},
		&models_role.Role{},
		&models_workspace.WorkspaceInvite{},
		&models_role_permission.RolePermission{},
		&models_server.Server{},
		&models_service.Service{},
		&models_service.ServiceGitConfig{},
		&models_service.ServiceEnvVariable{},
		&models_service.Deployment{},
	); err != nil {
		log.Fatalf("❌  Migration failed: %v", err)
	}
	fmt.Println("✅  Migrations done")

	// ── 2. Duplicate check ───────────────────────────────────────────────────
	var existing models_auth.User
	if db.DB.Where("email = ? OR username = ?", *argEmail, *argUsername).
		First(&existing).Error == nil {
		log.Fatalf("❌  User already exists (id=%d, email=%s)", existing.ID, existing.Email)
	}

	// ── 3. Hash password ─────────────────────────────────────────────────────
	hashedPassword, err := utils.HashPassword(*argPassword)
	if err != nil {
		log.Fatalf("❌  Failed to hash password: %v", err)
	}

	// ── Main transaction ──────────────────────────────────────────────────────
	var (
		newUser   models_auth.User
		ownerRole models_role.Role
	)

	fmt.Printf("👤  Creating user %q (%s)…\n", *argUsername, *argEmail)

	err = db.DB.Transaction(func(tx *gorm.DB) error {

		// ── 3. Create user (must be first — roles reference created_by_id) ───
		newUser = models_auth.User{
			BaseModel:     models_base.BaseModel{UUID: uuid.New()},
			Name:          *argName,
			Username:      *argUsername,
			Email:         *argEmail,
			EmailVerified: true,
			Password:      hashedPassword,
		}
		if err := tx.Create(&newUser).Error; err != nil {
			return fmt.Errorf("create user: %w", err)
		}

		// ── 4. Seed system roles ──────────────────────────────────────────────
		fmt.Println("🔑  Seeding system roles…")
		for _, r := range systemRoles {
			role := models_role.Role{
				RoleName:    r.Name,
				Description: r.Description,
				WorkspaceID: nil,        // system-level, not scoped to a workspace
				CreatedByID: newUser.ID, // satisfy the FK — use the new user
				IsSystem:    true,
			}
			result := tx.Where(models_role.Role{RoleName: r.Name, IsSystem: true, WorkspaceID: nil}).
				FirstOrCreate(&role)
			if result.Error != nil {
				return fmt.Errorf("seed role %q: %w", r.Name, result.Error)
			}
			if result.RowsAffected == 0 {
				fmt.Printf("   ↩  Role %q already exists (id=%d)\n", r.Name, role.ID)
			} else {
				fmt.Printf("   ✚  Created role %q (id=%d)\n", r.Name, role.ID)
			}
			if role.RoleName == "Owner" {
				ownerRole = role
			}
		}

		// If Owner already existed, fetch it
		if ownerRole.ID == 0 {
			if err := tx.
				Where("LOWER(TRIM(role_name)) = 'owner' AND is_system = true AND workspace_id IS NULL").
				First(&ownerRole).Error; err != nil {
				return fmt.Errorf("fetch owner role: %w", err)
			}
		}

		// ── 5. Grant Owner all permissions (mirrors grant_owner_all_permissions.sql)
		fmt.Println("🔐  Granting Owner role all permissions…")
		var allPermissions []models_permission.Permission
		if err := tx.Find(&allPermissions).Error; err != nil {
			return fmt.Errorf("fetch permissions: %w", err)
		}
		if len(allPermissions) == 0 {
			fmt.Println("   ⚠️   No permissions in DB yet — grant step skipped")
		} else {
			granted := 0
			for _, p := range allPermissions {
				rp := models_role_permission.RolePermission{
					RoleID:       ownerRole.ID,
					PermissionID: p.ID,
				}
				res := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&rp)
				if res.Error != nil {
					return fmt.Errorf("grant permission %d: %w", p.ID, res.Error)
				}
				if res.RowsAffected > 0 {
					granted++
				}
			}
			fmt.Printf("   ✅  %d permission(s) granted to Owner (total: %d)\n",
				granted, len(allPermissions))
		}

		// ── 6. Create default workspace ───────────────────────────────────────
		workspace := models_workspace.Workspace{
			WorkspaceName: *argUsername + "'s Workspace",
			OwnerID:       newUser.ID,
			CreatedByID:   newUser.ID,
		}
		if err := tx.Create(&workspace).Error; err != nil {
			return fmt.Errorf("create workspace: %w", err)
		}

		// ── 7. Add user as workspace owner member ─────────────────────────────
		member := models_workspace.WorkspaceMember{
			WorkspaceID: workspace.ID,
			UserId:      newUser.ID,
			RoleID:      ownerRole.ID,
			Status:      "ACTIVE",
			InvitedByID: newUser.ID,
		}
		if err := tx.Create(&member).Error; err != nil {
			return fmt.Errorf("create workspace member: %w", err)
		}

		return nil
	})

	if err != nil {
		log.Fatalf("❌  Bootstrap failed: %v", err)
	}

	fmt.Println()
	fmt.Println("🎉  Bootstrap complete!")
	fmt.Printf("    User ID:   %d\n", newUser.ID)
	fmt.Printf("    UUID:      %s\n", newUser.UUID)
	fmt.Printf("    Username:  %s\n", newUser.Username)
	fmt.Printf("    Email:     %s\n", newUser.Email)
	fmt.Printf("    Verified:  %t\n", newUser.EmailVerified)
	fmt.Printf("    Role:      Owner (id=%d)\n", ownerRole.ID)
	fmt.Printf("    Workspace: %s's Workspace\n", *argUsername)
}
