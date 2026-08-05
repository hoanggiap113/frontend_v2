import { isMockMode } from '#/shared/config/env'
import { endpoints } from '#/shared/service/endpoints'
import { httpClient } from '#/shared/service/http/client'
import { mockDelay } from '#/shared/service/utils'
import type { AuthTokenResponse } from '#/features/auth'
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
