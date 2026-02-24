import { privateRequest, publicRequest } from '@/lib/requestMethod';

export const getWorkspaceInviteByToken = (token: string) =>
  publicRequest.get(`/invites/${token}`);

export const acceptWorkspaceInvite = (token: string) =>
  privateRequest.post(`/invites/${token}/accept`);

export const declineWorkspaceInvite = (token: string) =>
  privateRequest.post(`/invites/${token}/decline`);

export const getInvites = () => privateRequest.get('/invites');

export const getWorkspaceInvites = (workspaceUUID: string) =>
  privateRequest.get(`/invites/workspace/${workspaceUUID}`);
