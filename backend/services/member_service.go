package services

import (
	"errors"

	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"backend/repositories"
	"gorm.io/gorm"
)

type MemberService struct {
	MemberRepo    *repositories.MemberRepository
	WorkspaceRepo *repositories.WorkspaceRepository
}

func NewMemberService(
	memberRepo *repositories.MemberRepository,
	workspaceRepo *repositories.WorkspaceRepository,
) *MemberService {
	return &MemberService{
		MemberRepo:    memberRepo,
		WorkspaceRepo: workspaceRepo,
	}
}

func (s *MemberService) GetMembers(tx *gorm.DB, userID uint, workspaceUUID string) ([]dtos_workspace.MemberResponseDTO, error) {

	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	// 🔐 RBAC check will go here later
	// Example:
	// if !s.permissionService.Can(userID, "workspace.members.read", workspace.ID) {
	//     return nil, errors.New("permission denied")
	// }

	members, err := s.MemberRepo.GetByWorkspaceID(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(members), nil
}

func (s *MemberService) mapToDTO(members []models_workspace.WorkspaceMember) []dtos_workspace.MemberResponseDTO {
	var response []dtos_workspace.MemberResponseDTO

	for _, member := range members {

		name := member.User.Name
		if name == "" {
			name = member.User.Username
		}

		response = append(response, dtos_workspace.MemberResponseDTO{
			UserUUID:  member.User.UUID,
			UserEmail: member.User.Email,
			UserName:  name,
			RoleName:  member.Role.RoleName,
			RoleUUID:  member.Role.UUID,
			InvitedBy: member.InvitedBy.Name,
		})
	}

	return response
}

func (s *MemberService) AddInternalMember(
	tx *gorm.DB,
	workspaceID uint,
	userID uint,
	roleID uint,
	invitedByID uint,
) error {

	exists, err := s.MemberRepo.Exists(tx, workspaceID, userID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("user already a member of workspace")
	}

	member := models_workspace.WorkspaceMember{
		WorkspaceID: workspaceID,
		UserId:      userID,
		RoleID:      roleID,
		Status:      "ACTIVE",
		InvitedByID: invitedByID,
	}

	return s.MemberRepo.Create(tx, member)
}
