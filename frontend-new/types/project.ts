import { Environment } from "./environment"

export interface Project {
  uuid: string
  name: string
  description?: string
  framework?: string
  workspace_uuid: string
  created_at: string
  environments: Environment[]
}
