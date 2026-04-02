export interface CreateServicePayload {
  name: string;
  projectUuid: string;
  environmentUuid?: string;
  type: string;
  framework: string;
  description: string;
  buildCommand: string;
  startCommand: string;
  deployPath: string;
  outputDirectory?: string;
  port: number;
  dockerizeType: string;

  domain?: string;
  httpsEnabled?: boolean;
  certType?: string;
  customCert?: string;
  customKey?: string;
  serverId: string;
  git: {
    provider: string;
    repositoryUrl: string;
    branch: string;
    subDirectory: string;
    authType: string;
    autoDeploy?: boolean;
    webhookEnabled?: boolean;
  };
  envVariables: {
    key: string;
    value: string;
    isSecret: boolean;
    isBuildVariable: boolean;
  }[];
}

export type UpdateServicePayload = CreateServicePayload;

export interface ServiceDetails extends Service {
  environmentUuid?: string;
  latestDeploymentStatus?: string;
  latestDeploymentUuid?: string;
  git?: {
    provider: string;
    repositoryUrl: string;
    branch: string;
    subDirectory: string;
    authType: string;
    autoDeploy: boolean;
    webhookEnabled: boolean;
  };
  envVariables?: {
    key: string;
    value: string;
    isSecret: boolean;
    isBuildVariable: boolean;
  }[];
  server?: {
    serverId?: number;
    name: string;
    host: string;
    port: number;
    username: string;
    passKey: string;
    authType: string;
  };
  project?: {
    uuid: string;
    name: string;
    description: string;
    workspaceId: number;
  };
  environment?: {
    uuid: string;
    name: string;
  };
}

export interface Service {
  uuid: string;
  name: string;
  projectId: number;
  environmentId: number;
  type: string;
  framework: string;
  description: string;
  buildCommand: string;
  startCommand: string;
  deployPath: string;
  outputDirectory?: string;
  port: number;
  dockerizeType: string;

  domain?: string;
  httpsEnabled?: boolean;
  certType?: string;
  customCert?: string;
  customKey?: string;

  createdAt: string;
  status?: string;
}
