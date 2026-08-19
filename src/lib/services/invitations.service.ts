import { isMockMode } from '#/lib/env'
import { endpoints } from '#/lib/services/endpoints'
import { httpClient } from '#/lib/services/http/client'
import { mockDelay } from '#/lib/utils'
import type { AuthTokenResponse } from '#/lib/types/auth-token'
import type {
  AcceptInvitationPayload,
  InvitationInfoResponse,
  InvitationResponse,
  InviteMemberPayload,
} from '../types/invitation'

export const invitationsService = {
  async inviteMember(
    workspaceId: string,
    payload: InviteMemberPayload,
  ): Promise<InvitationResponse> {
    if (isMockMode()) {
      await mockDelay(280)
      return {
        email: payload.email,
        role: payload.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    }

    return httpClient.post<InvitationResponse>(
      endpoints.users.invite(workspaceId),
      payload,
    )
  },

  async getInfo(token: string): Promise<InvitationInfoResponse> {
    if (isMockMode()) {
      await mockDelay(220)
      return {
        email: 'member@example.com',
        tenantName: 'Demo Workspace',
        role: 'MEMBER',
        accountExists: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    }

    return httpClient.get<InvitationInfoResponse>(
      endpoints.invitations.detail(token),
    )
  },

  async accept(
    token: string,
    payload?: AcceptInvitationPayload,
  ): Promise<AuthTokenResponse> {
    if (isMockMode()) {
      await mockDelay(320)
      return {
        accessToken: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
      }
    }

    return httpClient.post<AuthTokenResponse>(
      endpoints.invitations.accept(token),
      payload ?? {},
    )
  },
}
