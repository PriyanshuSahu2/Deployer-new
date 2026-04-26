import { getOverview } from '@/service/dashboard';
import { useQuery } from '@tanstack/react-query';

export const useOverview = (workspaceId: string) => {
  return useQuery({
    queryKey: ['overview', workspaceId],
    queryFn: () => getOverview(workspaceId),
    enabled: !!workspaceId,
  });
};
