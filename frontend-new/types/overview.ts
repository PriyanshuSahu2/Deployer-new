export interface OverviewAlert {
  id: string;
  type: 'failed_deployment' | 'service_down' | 'build_failure' | string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | string;
  status: string;
  createdAt: string;
}

export interface OverviewActivity {
  id: string;
  type: 'deployment' | 'service_restart' | string;
  title: string;
  status: string;
  createdAt: string;
}

export interface SystemLoadSnapshot {
  cpu: number;
  memory: number;
  runningServices: number;
}

export interface WorkspaceOverview {
  activeServices: number;
  totalProjects: number;
  totalServices: number;
  successRate: number;
  successRate24h: number;
  successRate7d: number;
  activeAlerts: number;
  lastDeployment: string | null;
  alerts: OverviewAlert[];
  activities: OverviewActivity[];
  systemLoad: SystemLoadSnapshot;
}
