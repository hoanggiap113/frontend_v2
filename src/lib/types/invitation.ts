import type { TenantRole } from './workspace'

export interface InviteMemberPayload {
  email: string
  role: TenantRole
}

export interface InvitationResponse {
  email: string
  role: TenantRole
  expiresAt: string
}

export interface InvitationInfoResponse {
  email: string
  tenantName: string
  role: TenantRole
  accountExists: boolean
  expiresAt: string
}

export interface AcceptInvitationPayload {
  name?: string
  password?: string
}
