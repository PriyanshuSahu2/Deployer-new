package container

import (
	controllers_auth "backend/controllers/auth"
	controller_invite "backend/controllers/invite"
	controller_member "backend/controllers/member"
	controller_roles "backend/controllers/roles"
	controller_workspace "backend/controllers/workspace"
	"backend/middleware"

	"backend/db"
	redisclient "backend/redis"
	"backend/repositories"
	"backend/services"
)

type Container struct {
	InviteController          *controller_invite.InviteController
	RoleController            *controller_roles.RoleController
	WorkspaceController       *controller_workspace.WorkspaceController
	WorkspaceMemberController *controller_workspace.WorkspaceMemberController
	AuthController            *controllers_auth.AuthController
	MemberController          *controller_member.MemberController
	PermissionMW              *middleware.PermissionMiddleware
}

func NewContainer(emailService *services.EmailService) *Container {

	/* ---------------- REPOSITORIES ---------------- */

	inviteRepo := repositories.NewInviteRepository()
	memberRepo := repositories.NewMemberRepository()
	userRepo := repositories.NewUserRepository()
	workspaceRepo := repositories.NewWorkspaceRepository()
	roleRepo := repositories.NewRoleRepository()
	redisRepo := repositories.NewRedisRepository(redisclient.Client)

	/* ---------------- SERVICES ---------------- */

	inviteService := services.NewInviteService(
		inviteRepo,
		memberRepo,
		userRepo,
		workspaceRepo,
	)

	roleService := services.NewRoleService(
		roleRepo,
		workspaceRepo,
		redisRepo,
	)

	workspaceService := services.NewWorkspaceService(
		workspaceRepo,
		memberRepo,
	)

	workspaceMemberService := services.NewWorkspaceMemberService(
		userRepo,
		workspaceRepo,
		roleRepo,
		inviteRepo,
		emailService,
		db.DB,
	)

	memberService := services.NewMemberService(memberRepo, workspaceRepo)

	/* ---------------- CONTROLLERS ---------------- */

	inviteController := controller_invite.NewInviteController(inviteService)

	roleController := controller_roles.NewRoleController(roleService)

	workspaceController := controller_workspace.NewWorkspaceController(workspaceService)

	workspaceMemberController := controller_workspace.NewWorkspaceMemberController(
		workspaceMemberService,
	)

	memberController := controller_member.NewMemberController(memberService)
	authController := controllers_auth.NewAuthController(emailService)
	/* ---------------- RETURN CONTAINER ---------------- */

	permissionMW := middleware.NewPermissionMiddleware(roleService)

	return &Container{
		InviteController:          inviteController,
		RoleController:            roleController,
		WorkspaceController:       workspaceController,
		WorkspaceMemberController: workspaceMemberController,
		AuthController:            authController,
		MemberController:          memberController,
		PermissionMW:              permissionMW,
	}
}
