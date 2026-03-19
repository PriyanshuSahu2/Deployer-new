import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privateRequest } from '@/lib/requestMethod';

// Interfaces mapping to backend DTOs
export interface Integration {
  id: number;
  workspaceId: number;
  provider: string;
  accountName: string;
  accountId: string;
  installationId?: string;
  isActive: boolean;
}

export interface IntegrationsResponse {
  integrations: Integration[];
}

export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
}

export interface GithubBranch {
  name: string;
}

export const useGetIntegrations = (workspaceId: string, enabled = true) => {
  return useQuery({
    queryKey: ['integrations', workspaceId],
    queryFn: async (): Promise<Integration[]> => {
      const response = await privateRequest.get<IntegrationsResponse>(
        `/workspaces/${workspaceId}/integrations`
      );
      return response.data.integrations || [];
    },
    enabled: !!workspaceId && enabled,
  });
};

export const useGetGithubAuthUrl = (workspaceId: string) => {
  return useQuery({
    queryKey: ['github-auth-url', workspaceId],
    queryFn: async (): Promise<string> => {
      const response = await privateRequest.get<{ url: string }>(
        `/workspaces/${workspaceId}/integrations/github/auth`
      );
      return response.data.url;
    },
    enabled: !!workspaceId,
    staleTime: Infinity,
  });
};

export const useDisconnectIntegration = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: string) => {
      await privateRequest.delete(
        `/workspaces/${workspaceId}/integrations/${provider}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', workspaceId] });
    },
  });
};

export const useGetGithubRepos = (workspaceId: string, enabled = true) => {
  return useQuery({
    queryKey: ['github-repos', workspaceId],
    queryFn: async (): Promise<GithubRepo[]> => {
      const response = await privateRequest.get<GithubRepo[]>(
        `/workspaces/${workspaceId}/integrations/github/repos`
      );
      return response.data || [];
    },
    enabled: !!workspaceId && enabled,
  });
};

export const useGetGithubBranches = (workspaceId: string, repoFullName: string, enabled = true) => {
  return useQuery({
    queryKey: ['github-branches', workspaceId, repoFullName],
    queryFn: async (): Promise<GithubBranch[]> => {
      const response = await privateRequest.get<GithubBranch[]>(
        `/workspaces/${workspaceId}/integrations/github/branches?repo=${encodeURIComponent(repoFullName)}`
      );
      return response.data || [];
    },
    enabled: !!workspaceId && !!repoFullName && enabled,
  });
};

