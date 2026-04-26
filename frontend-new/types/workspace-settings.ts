export interface WorkspaceSettingsMember {
  userUuid: string;
  name: string;
  email: string;
  role: string;
}

export interface WorkspaceAPIKey {
  uuid: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface WorkspaceSettings {
  uuid: string;
  name: string;
  defaultBranch: string;
  autoDeployDefault: boolean;
  defaultEnvironmentName: string;
  deploymentTimeoutSeconds: number;
  allowedEmailDomains: string[];
  enforceInviteRestrictions: boolean;
  requireTwoFactor: boolean;
  enablePreviewDeployments: boolean;
  enableExperimentalFeatures: boolean;
  ownerUserUuid: string;
  isOwner: boolean;
  createdAt: string;
  apiKeys: WorkspaceAPIKey[];
  members: WorkspaceSettingsMember[];
}

export interface UpdateWorkspaceSettingsPayload {
  name: string;
  defaultBranch: string;
  autoDeployDefault: boolean;
  defaultEnvironmentName: string;
  deploymentTimeoutSeconds: number;
  allowedEmailDomains: string[];
  enforceInviteRestrictions: boolean;
  requireTwoFactor: boolean;
  enablePreviewDeployments: boolean;
  enableExperimentalFeatures: boolean;
}

export interface CreatedWorkspaceAPIKey extends WorkspaceAPIKey {
  key: string;
}
