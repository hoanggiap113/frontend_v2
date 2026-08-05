import { userStats } from '../data/mock_data'
import { formatDate } from '#/shared/lib/datetime-helper'
import { isValidEmail } from '#/shared/lib/validation-helper'
import type { UserItem } from '../data/mock_data'
import type { TenantRole } from '#/features/workspaces'

export const USER_ROLE_STYLES = {
  owner: 'bg-violet-50 text-violet-700',
  admin: 'bg-emerald-50 text-emerald-700',
  member: 'bg-slate-100 text-slate-600',
} as const

export const USER_STATUS_STYLES = {
  online: 'bg-emerald-50 text-emerald-700',
  away: 'bg-amber-50 text-amber-700',
  offline: 'bg-slate-100 text-slate-500',
} as const

export const INVITE_ROLES: TenantRole[] = ['MEMBER', 'ADMIN', 'OWNER']
export const EDITABLE_ROLES: TenantRole[] = ['MEMBER', 'ADMIN']

export function userRoleToTenantRole(role: string): TenantRole {
  return role.toUpperCase() as TenantRole
}

export function getInviteRolesForTenantRole(role?: TenantRole | null) {
  if (role === 'OWNER') return INVITE_ROLES
  if (role === 'ADMIN') return ['MEMBER'] satisfies TenantRole[]
  return [] satisfies TenantRole[]
}

export function canInviteMember(
  workspaceId: string,
  email: string,
  role?: TenantRole | null,
) {
  return (
    Boolean(workspaceId) &&
    isValidEmail(email) &&
    getInviteRolesForTenantRole(role).length > 0
  )
}

export function canUpdateMemberRole(
  currentRole: TenantRole | null | undefined,
  targetRole: TenantRole,
) {
  return currentRole === 'OWNER' && targetRole !== 'OWNER'
}

export function canRemoveMember(
  currentRole: TenantRole | null | undefined,
  targetRole: TenantRole,
) {
  if (currentRole === 'OWNER') return targetRole !== 'OWNER'
  if (currentRole === 'ADMIN') return targetRole === 'MEMBER'
  return false
}

export function canLeaveWorkspace(role?: TenantRole | null) {
  return Boolean(role) && role !== 'OWNER'
}

export function buildUserStats(users: UserItem[], workspaceId: string) {
  if (!workspaceId) return userStats

  return [
    {
      label: 'Tổng thành viên',
      value: String(users.length),
      note: `${users.filter((user) => user.role === 'admin').length} admin`,
    },
    ...userStats.slice(1),
  ]
}

export function buildInvitationSuccessMessage(invitation: {
  email: string
  expiresAt: string
}) {
  return `Đã gửi lời mời tới ${invitation.email}. Link hết hạn ngày ${formatDate(
    invitation.expiresAt,
  )}.`
}
