package container

import (
	controllers_auth "backend/controllers/auth"
	controller_invite "backend/controllers/invite"
	controller_member "backend/controllers/member"
	controller_project "backend/controllers/project"
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
	ProjectController         *controller_project.ProjectController
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
	projectRepo := repositories.NewProjectRepository()
	environmentRepo := repositories.NewEnvironmentRepository()
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
		roleService,
	)
	projectService := services.NewProjectService(projectRepo, workspaceRepo, environmentRepo)

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
	projectController := controller_project.NewProjectController(projectService)

	workspaceController := controller_workspace.NewWorkspaceController(workspaceService)

	workspaceMemberController := controller_workspace.NewWorkspaceMemberController(
		workspaceMemberService,
	)

	memberController := controller_member.NewMemberController(memberService)
	authController := controllers_auth.NewAuthController(emailService, workspaceService, memberService)
	/* ---------------- RETURN CONTAINER ---------------- */

	permissionMW := middleware.NewPermissionMiddleware(roleService, workspaceRepo)

	return &Container{
		InviteController:          inviteController,
		RoleController:            roleController,
		ProjectController:         projectController,
		WorkspaceController:       workspaceController,
		WorkspaceMemberController: workspaceMemberController,
		AuthController:            authController,
		MemberController:          memberController,
		PermissionMW:              permissionMW,
	}
}
