export interface Server {
  uuid: string;
  workspace_id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: string;
  pass_key?: string;
  created_by_id: number;
  created_at: string;
}

export interface CreateServerPayload {
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: string;
  pass_key?: string;
}

export interface UpdateServerPayload extends CreateServerPayload {
  uuid: string;
}

export interface TestConnectionPayload {
  uuid?: string;
  host?: string;
  port?: number;
  username?: string;
  auth_type?: string;
  pass_key?: string;
}
