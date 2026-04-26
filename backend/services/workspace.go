package services

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"backend/repositories"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"gorm.io/gorm"
)

var (
	ErrWorkspaceForbidden     = errors.New("forbidden")
	ErrWorkspaceNotFound      = errors.New("workspace not found")
	ErrWorkspaceMemberMissing = errors.New("target user is not a workspace member")
	ErrWorkspaceSelfTransfer  = errors.New("cannot transfer ownership to yourself")
)

type WorkspaceService struct {
	WorkspaceRepo *repositories.WorkspaceRepository
	MemberRepo    *repositories.MemberRepository
	APIKeyRepo    *repositories.WorkspaceAPIKeyRepository
	RoleService   *RoleService
}

func NewWorkspaceService(
	workspaceRepo *repositories.WorkspaceRepository,
	memberRepo *repositories.MemberRepository,
	apiKeyRepo *repositories.WorkspaceAPIKeyRepository,
	roleService *RoleService,
) *WorkspaceService {
	return &WorkspaceService{
		WorkspaceRepo: workspaceRepo,
		MemberRepo:    memberRepo,
		APIKeyRepo:    apiKeyRepo,
		RoleService:   roleService,
	}
}
func GetWorkspaceByUUID(tx *gorm.DB, uuid string) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Where("uuid = ?", uuid).
		First(&workspace).Error

	if err != nil {
		return nil, err
	}

	return &workspace, nil
}

func (s *WorkspaceService) CreateWorkspace(tx *gorm.DB, userID uint, dto dtos_workspace.CreateWorkspaceDTO) (models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace

	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Transaction(func(tx2 *gorm.DB) error {
		systemRoles, err := s.RoleService.EnsureSystemRoles(tx2, userID)
		if err != nil {
			return err
		}

		ownerRole, exists := systemRoles["Owner"]
		if !exists || ownerRole.ID == 0 {
			return errors.New("owner role not found")
		}

		workspace = models_workspace.Workspace{
			WorkspaceName:              dto.Name,
			Slug:                       normalizeWorkspaceSlug("", dto.Name),
			OwnerID:                    userID,
			CreatedByID:                userID,
			DefaultBranch:              "main",
			AutoDeployDefault:          true,
			DefaultEnvironmentName:     "production",
			DeploymentTimeoutSeconds:   300,
			EnablePreviewDeployments:   true,
			EnableExperimentalFeatures: false,
			EnforceInviteRestrictions:  false,
			RequireTwoFactor:           false,
		}

		if err := s.WorkspaceRepo.Create(tx2, &workspace); err != nil {
			return err
		}

		// Automatically add owner as member
		if err := s.MemberRepo.Create(tx2, models_workspace.WorkspaceMember{
			WorkspaceID: workspace.ID,
			UserId:      userID,
			RoleID:      ownerRole.ID,
			Status:      "ACTIVE",
			InvitedByID: userID,
		}); err != nil {
			return err
		}

		return nil
	})

	return workspace, err
}

func (s *WorkspaceService) UpdateWorkspace(tx *gorm.DB, userID uint, dto dtos_workspace.UpdateWorkspaceDTO) error {

	workspace, err := s.WorkspaceRepo.GetByUUIDAndOwner(tx, dto.UUID, userID)
	if err != nil {
		return ErrWorkspaceNotFound
	}

	workspace.WorkspaceName = dto.Name
	return s.WorkspaceRepo.Update(tx, workspace)
}

func (s *WorkspaceService) GetWorkspaceSettings(tx *gorm.DB, userID uint, workspaceUUID string) (*dtos_workspace.WorkspaceSettingsDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, ErrWorkspaceNotFound
	}

	members, err := s.MemberRepo.GetByWorkspaceID(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	keys, err := s.APIKeyRepo.ListActiveByWorkspace(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	dto := s.mapWorkspaceSettings(workspace, userID, members, keys)
	return &dto, nil
}

func (s *WorkspaceService) UpdateWorkspaceSettings(tx *gorm.DB, userID uint, workspaceUUID string, dto dtos_workspace.UpdateWorkspaceSettingsDTO) error {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return ErrWorkspaceNotFound
	}

	if workspace.OwnerID != userID {
		return ErrWorkspaceForbidden
	}

	name := strings.TrimSpace(dto.Name)
	if len(name) < 3 {
		return errors.New("workspace name must be at least 3 characters")
	}

	workspace.WorkspaceName = name
	workspace.Slug = normalizeWorkspaceSlug(dto.Slug, name)
	workspace.DefaultBranch = defaultString(dto.DefaultBranch, "main")
	workspace.AutoDeployDefault = dto.AutoDeployDefault
	workspace.DefaultEnvironmentName = defaultString(dto.DefaultEnvironmentName, "production")
	workspace.DeploymentTimeoutSeconds = clampInt(dto.DeploymentTimeoutSeconds, 30, 3600, 300)
	workspace.AllowedEmailDomains = strings.Join(normalizeEmailDomains(dto.AllowedEmailDomains), ",")
	workspace.EnforceInviteRestrictions = dto.EnforceInviteRestrictions
	workspace.RequireTwoFactor = dto.RequireTwoFactor
	workspace.EnablePreviewDeployments = dto.EnablePreviewDeployments
	workspace.EnableExperimentalFeatures = dto.EnableExperimentalFeatures

	return s.WorkspaceRepo.Update(tx, workspace)
}

func (s *WorkspaceService) CreateWorkspaceAPIKey(tx *gorm.DB, userID uint, workspaceUUID string, dto dtos_workspace.CreateWorkspaceAPIKeyDTO) (*dtos_workspace.CreatedWorkspaceAPIKeyDTO, error) {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, ErrWorkspaceNotFound
	}

	if workspace.OwnerID != userID {
		return nil, ErrWorkspaceForbidden
	}

	name := strings.TrimSpace(dto.Name)
	if len(name) < 2 {
		return nil, errors.New("key name must be at least 2 characters")
	}

	rawKey, err := generateWorkspaceAPIKey()
	if err != nil {
		return nil, err
	}

	key := models_workspace.WorkspaceAPIKey{
		WorkspaceID: workspace.ID,
		Name:        name,
		KeyHash:     hashWorkspaceAPIKey(rawKey),
		KeyPrefix:   rawKey[:12],
		CreatedByID: userID,
	}

	if err := s.APIKeyRepo.Create(tx, &key); err != nil {
		return nil, err
	}

	return &dtos_workspace.CreatedWorkspaceAPIKeyDTO{
		WorkspaceAPIKeyDTO: mapAPIKeyDTO(key),
		Key:                rawKey,
	}, nil
}

func (s *WorkspaceService) RevokeWorkspaceAPIKey(tx *gorm.DB, userID uint, workspaceUUID string, keyUUID string) error {
	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return ErrWorkspaceNotFound
	}

	if workspace.OwnerID != userID {
		return ErrWorkspaceForbidden
	}

	return s.APIKeyRepo.RevokeByUUIDAndWorkspace(tx, keyUUID, workspace.ID)
}

func (s *WorkspaceService) TransferOwnership(tx *gorm.DB, userID uint, workspaceUUID string, dto dtos_workspace.TransferOwnershipDTO) error {
	query := db.DB
	if tx != nil {
		query = tx
	}

	return query.Transaction(func(tx2 *gorm.DB) error {
		workspace, err := s.WorkspaceRepo.GetByUUID(tx2, workspaceUUID)
		if err != nil {
			return ErrWorkspaceNotFound
		}

		if workspace.OwnerID != userID {
			return ErrWorkspaceForbidden
		}

		newOwnerMember, err := s.MemberRepo.GetByWorkspaceAndUserUUID(tx2, workspace.ID, strings.TrimSpace(dto.NewOwnerID))
		if err != nil {
			return ErrWorkspaceMemberMissing
		}

		if newOwnerMember.UserId == userID {
			return ErrWorkspaceSelfTransfer
		}

		oldOwnerMember, err := s.MemberRepo.GetByWorkspaceAndUserID(tx2, workspace.ID, userID)
		if err != nil {
			return ErrWorkspaceMemberMissing
		}

		roles, err := s.RoleService.EnsureSystemRoles(tx2, userID)
		if err != nil {
			return err
		}

		ownerRole, ok := roles["Owner"]
		if !ok || ownerRole.ID == 0 {
			return errors.New("owner role not found")
		}

		managerRole, ok := roles["Manager"]
		if !ok || managerRole.ID == 0 {
			return errors.New("manager role not found")
		}

		workspace.OwnerID = newOwnerMember.UserId
		if err := s.WorkspaceRepo.Update(tx2, workspace); err != nil {
			return err
		}

		newOwnerMember.RoleID = ownerRole.ID
		newOwnerMember.Status = "ACTIVE"
		if err := s.MemberRepo.Update(tx2, newOwnerMember); err != nil {
			return err
		}

		oldOwnerMember.RoleID = managerRole.ID
		oldOwnerMember.Status = "ACTIVE"
		if err := s.MemberRepo.Update(tx2, oldOwnerMember); err != nil {
			return err
		}

		_ = s.RoleService.RedisRepo.Delete(fmt.Sprintf("workspace:role:%s:%d", workspaceUUID, userID))
		_ = s.RoleService.RedisRepo.Delete(fmt.Sprintf("workspace:role:%s:%d", workspaceUUID, newOwnerMember.UserId))

		return nil
	})
}

func (s *WorkspaceService) ListWorkspaces(tx *gorm.DB, userID uint) ([]dtos_workspace.ListWorkspaceDTO, error) {

	workspaces, err := s.WorkspaceRepo.GetUserWorkspaces(tx, userID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(workspaces), nil
}

func (s *WorkspaceService) GetUserDefaultWorkspace(tx *gorm.DB, userID uint) (*dtos_workspace.ListWorkspaceDTO, error) {

	workspace, err := s.WorkspaceRepo.GetFirstAccessibleWorkspace(tx, userID)
	if err != nil {
		return nil, err
	}

	dto := dtos_workspace.ListWorkspaceDTO{
		UUID:      workspace.UUID,
		Name:      workspace.WorkspaceName,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}

	return &dto, nil
}

func (s *WorkspaceService) GetUserPermissions(tx *gorm.DB, workspaceUUID string, userID int) ([]string, error) {

	roleID, err := s.RoleService.GetUserRoleID(tx, workspaceUUID, userID)
	if err != nil {
		return nil, err
	}

	permissions, err := s.RoleService.GetRolePermissions(tx, uint(roleID))
	if err != nil {
		return nil, err
	}

	return permissions, nil
}

func (s *WorkspaceService) mapWorkspaceSettings(
	workspace *models_workspace.Workspace,
	userID uint,
	members []models_workspace.WorkspaceMember,
	keys []models_workspace.WorkspaceAPIKey,
) dtos_workspace.WorkspaceSettingsDTO {
	memberDTOs := make([]dtos_workspace.WorkspaceSettingsMemberDTO, 0, len(members))
	for _, member := range members {
		name := member.User.Name
		if name == "" {
			name = member.User.Username
		}

		memberDTOs = append(memberDTOs, dtos_workspace.WorkspaceSettingsMemberDTO{
			UserUUID: member.User.UUID.String(),
			Name:     name,
			Email:    member.User.Email,
			Role:     member.Role.RoleName,
		})
	}

	keyDTOs := make([]dtos_workspace.WorkspaceAPIKeyDTO, 0, len(keys))
	for _, key := range keys {
		keyDTOs = append(keyDTOs, mapAPIKeyDTO(key))
	}

	name := defaultString(workspace.WorkspaceName, "workspace")

	return dtos_workspace.WorkspaceSettingsDTO{
		UUID:                       workspace.UUID.String(),
		Name:                       workspace.WorkspaceName,
		Slug:                       defaultString(workspace.Slug, normalizeWorkspaceSlug("", name)),
		DefaultBranch:              defaultString(workspace.DefaultBranch, "main"),
		AutoDeployDefault:          workspace.AutoDeployDefault,
		DefaultEnvironmentName:     defaultString(workspace.DefaultEnvironmentName, "production"),
		DeploymentTimeoutSeconds:   defaultInt(workspace.DeploymentTimeoutSeconds, 300),
		AllowedEmailDomains:        splitEmailDomains(workspace.AllowedEmailDomains),
		EnforceInviteRestrictions:  workspace.EnforceInviteRestrictions,
		RequireTwoFactor:           workspace.RequireTwoFactor,
		EnablePreviewDeployments:   workspace.EnablePreviewDeployments,
		EnableExperimentalFeatures: workspace.EnableExperimentalFeatures,
		OwnerUserUUID:              ownerUUIDFromMembers(workspace.OwnerID, members),
		IsOwner:                    workspace.OwnerID == userID,
		CreatedAt:                  workspace.CreatedAt,
		APIKeys:                    keyDTOs,
		Members:                    memberDTOs,
	}
}

func mapAPIKeyDTO(key models_workspace.WorkspaceAPIKey) dtos_workspace.WorkspaceAPIKeyDTO {
	return dtos_workspace.WorkspaceAPIKeyDTO{
		UUID:       key.UUID.String(),
		Name:       key.Name,
		Prefix:     key.KeyPrefix,
		CreatedAt:  key.CreatedAt,
		LastUsedAt: key.LastUsedAt,
	}
}

func ownerUUIDFromMembers(ownerID uint, members []models_workspace.WorkspaceMember) string {
	for _, member := range members {
		if member.UserId == ownerID {
			return member.User.UUID.String()
		}
	}
	return ""
}

func generateWorkspaceAPIKey() (string, error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return "dep_" + hex.EncodeToString(bytes), nil
}

func hashWorkspaceAPIKey(key string) string {
	hash := sha256.Sum256([]byte(key))
	return hex.EncodeToString(hash[:])
}

func normalizeWorkspaceSlug(slug string, fallback string) string {
	value := strings.ToLower(strings.TrimSpace(slug))
	if value == "" {
		value = strings.ToLower(strings.TrimSpace(fallback))
	}
	value = regexp.MustCompile(`[^a-z0-9-]+`).ReplaceAllString(value, "-")
	value = regexp.MustCompile(`-+`).ReplaceAllString(value, "-")
	value = strings.Trim(value, "-")
	if value == "" {
		return "workspace"
	}
	return value
}

func normalizeEmailDomains(domains []string) []string {
	seen := make(map[string]struct{}, len(domains))
	normalized := make([]string, 0, len(domains))
	for _, domain := range domains {
		value := strings.ToLower(strings.TrimSpace(domain))
		if value == "" {
			continue
		}
		value = strings.TrimPrefix(value, "@")
		if !regexp.MustCompile(`^[a-z0-9.-]+\.[a-z]{2,}$`).MatchString(value) {
			continue
		}
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		normalized = append(normalized, value)
	}
	return normalized
}

func splitEmailDomains(value string) []string {
	if strings.TrimSpace(value) == "" {
		return []string{}
	}
	return normalizeEmailDomains(strings.Split(value, ","))
}

func defaultString(value string, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return strings.TrimSpace(value)
}

func defaultInt(value int, fallback int) int {
	if value == 0 {
		return fallback
	}
	return value
}

func clampInt(value int, min int, max int, fallback int) int {
	if value == 0 {
		return fallback
	}
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func (s *WorkspaceService) mapToDTO(workspaces []models_workspace.Workspace) []dtos_workspace.ListWorkspaceDTO {
	response := make([]dtos_workspace.ListWorkspaceDTO, len(workspaces))

	for i, w := range workspaces {
		response[i] = dtos_workspace.ListWorkspaceDTO{
			UUID:      w.UUID,
			Name:      w.WorkspaceName,
			CreatedAt: w.CreatedAt,
			UpdatedAt: w.UpdatedAt,
		}
	}

	return response
}
