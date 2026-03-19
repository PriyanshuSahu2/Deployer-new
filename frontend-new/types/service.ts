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
  serverId: string;
  git: {
    provider: string;
    repositoryUrl: string;
    branch: string;
    subDirectory: string;
    authType: string;
  };
  envVariables: {
    key: string;
    value: string;
    isSecret: boolean;
    isBuildVariable: boolean;
  }[];
}

export interface Service {
  id: number;
  name: string;
  projectId: number;
  environmentId: number;
  type: string;
  framework: string;
  description: string;
  buildCommand: string;
  startCommand: string;
  deployPath: string;
  createdAt: string;
}
