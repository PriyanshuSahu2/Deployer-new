package container

import (
	controllers_auth "backend/controllers/auth"
	controller_integration "backend/controllers/integration"
	controller_invite "backend/controllers/invite"
	controller_member "backend/controllers/member"
	controller_project "backend/controllers/project"
	controller_roles "backend/controllers/roles"
	controller_server "backend/controllers/server"
	controller_service "backend/controllers/service"
	controller_webhook "backend/controllers/webhook"
	controller_workspace "backend/controllers/workspace"
	"backend/middleware"
	"backend/rabbitmq"

	"backend/db"
	redisclient "backend/redis"
	"backend/repositories"
	"backend/services"
)

type Container struct {
	InviteController          *controller_invite.InviteController
	RoleController            *controller_roles.RoleController
	ProjectController         *controller_project.ProjectController
	ServerController          *controller_server.ServerController
	WorkspaceController       *controller_workspace.WorkspaceController
	WorkspaceMemberController *controller_workspace.WorkspaceMemberController
	AuthController            *controllers_auth.AuthController
	MemberController          *controller_member.MemberController
	PermissionMW              *middleware.PermissionMiddleware
	IntegrationController     *controller_integration.IntegrationController
	ServiceController         *controller_service.ServiceController
	WebhookController         *controller_webhook.WebhookController
	DashboardController       *controller_workspace.DashboardController
	LogController             *controller_service.LogController
}

func NewContainer(emailService *services.EmailService, rmq *rabbitmq.RabbitMQ) *Container {

	/* ---------------- REPOSITORIES ---------------- */

	inviteRepo := repositories.NewInviteRepository()
	memberRepo := repositories.NewMemberRepository()
	userRepo := repositories.NewUserRepository()
	workspaceRepo := repositories.NewWorkspaceRepository()
	workspaceAPIKeyRepo := repositories.NewWorkspaceAPIKeyRepository()
	roleRepo := repositories.NewRoleRepository()
	projectRepo := repositories.NewProjectRepository()
	environmentRepo := repositories.NewEnvironmentRepository()
	serverRepo := repositories.NewServerRepository()
	serviceRepo := repositories.NewServiceRepository()
	redisRepo := repositories.NewRedisRepository(redisclient.Client)
	integrationRepo := repositories.NewIntegrationRepository()
	deploymentRepo := repositories.NewDeploymentRepository()

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
		workspaceAPIKeyRepo,
		roleService,
	)
	integrationService := services.NewIntegrationService(integrationRepo, workspaceRepo)
	gitService := services.NewGitService(integrationService)

	projectService := services.NewProjectService(projectRepo, workspaceRepo, environmentRepo)
	sshService := services.NewSSHService()
	serverService := services.NewServerService(serverRepo, workspaceRepo, sshService)

	deploymentService := services.NewDeploymentService(sshService, gitService, serviceRepo, deploymentRepo)
	serviceService := services.NewServiceService(serviceRepo, projectRepo, environmentRepo, serverRepo, deploymentService, integrationService, rmq, deploymentRepo, sshService)

	workspaceMemberService := services.NewWorkspaceMemberService(
		userRepo,
		workspaceRepo,
		roleRepo,
		inviteRepo,
		emailService,
		db.DB,
	)

	memberService := services.NewMemberService(memberRepo, workspaceRepo)
	dashboardService := services.NewDashboardService(workspaceRepo, projectRepo, serviceRepo, serverRepo, deploymentRepo)

	/* ---------------- CONTROLLERS ---------------- */

	inviteController := controller_invite.NewInviteController(inviteService)

	roleController := controller_roles.NewRoleController(roleService)
	projectController := controller_project.NewProjectController(projectService)
	serverController := controller_server.NewServerController(serverService)
	serviceController := controller_service.NewServiceController(serviceService)

	workspaceController := controller_workspace.NewWorkspaceController(workspaceService)
	webhookController := controller_webhook.NewWebhookController(serviceService)

	workspaceMemberController := controller_workspace.NewWorkspaceMemberController(
		workspaceMemberService,
	)

	memberController := controller_member.NewMemberController(memberService)
	authController := controllers_auth.NewAuthController(emailService, workspaceService, memberService)
	integrationController := controller_integration.NewIntegrationController(integrationService)
	dashboardController := controller_workspace.NewDashboardController(dashboardService)

	logStreamer := services.NewLogStreamer(serviceService, sshService)
	logController := controller_service.NewLogController(logStreamer)

	/* ---------------- RETURN CONTAINER ---------------- */

	permissionMW := middleware.NewPermissionMiddleware(roleService, workspaceRepo)

	return &Container{
		InviteController:          inviteController,
		RoleController:            roleController,
		ProjectController:         projectController,
		ServerController:          serverController,
		WorkspaceController:       workspaceController,
		WorkspaceMemberController: workspaceMemberController,
		AuthController:            authController,
		MemberController:          memberController,
		PermissionMW:              permissionMW,
		IntegrationController:     integrationController,
		ServiceController:         serviceController,
		WebhookController:         webhookController,
		DashboardController:       dashboardController,
		LogController:             logController,
	}
}
