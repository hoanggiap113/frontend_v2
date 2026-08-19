import { clone, mockDelay } from '#/lib/utils'
import { mockUsers, type UserItem } from './mocks/users.mock'
import { isMockMode } from '#/lib/env'
import { endpoints } from '#/lib/services/endpoints'
import { httpClient } from '#/lib/services/http/client'
import type { TenantRole } from '#/lib/types/workspace'

export type WorkspaceUser = UserItem

let mockUserState = clone(mockUsers)

interface MemberResponse {
  userId: string
  name: string
  email: string
  role: TenantRole
  joinedAt: string
}

function roleToUserRole(role: TenantRole): WorkspaceUser['role'] {
  return role.toLowerCase() as WorkspaceUser['role']
}

function permissionsForRole(role: TenantRole) {
  if (role === 'OWNER') {
    return ['channels:rw', 'messages:rw', 'jobs:rw', 'users:rw', 'settings:rw']
  }
  if (role === 'ADMIN') {
    return ['channels:rw', 'messages:rw', 'jobs:rw', 'users:rw']
  }
  return ['messages:r', 'jobs:r']
}

function memberToWorkspaceUser(member: MemberResponse): WorkspaceUser {
  return {
    id: member.userId,
    name: member.name,
    email: member.email,
    role: roleToUserRole(member.role),
    team: 'Workspace',
    status: 'offline',
    workload: 0,
    permissions: permissionsForRole(member.role),
  }
}

export const usersService = {
  async list(workspaceId: string): Promise<WorkspaceUser[]> {
    if (isMockMode()) {
      await mockDelay()
      return clone(mockUserState)
    }
    const members = await httpClient.get<MemberResponse[]>(
      endpoints.users.list(workspaceId),
    )
    return members.map(memberToWorkspaceUser)
  },

  async updateRole(
    workspaceId: string,
    userId: string,
    role: TenantRole,
  ): Promise<void> {
    if (isMockMode()) {
      await mockDelay(220)
      mockUserState = mockUserState.map((user) =>
        user.id === userId ? { ...user, role: roleToUserRole(role) } : user,
      )
      return
    }

    await httpClient.put(endpoints.users.member(workspaceId, userId), { role })
  },

  async remove(workspaceId: string, userId: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay(220)
      mockUserState = mockUserState.filter((user) => user.id !== userId)
      return
    }
    await httpClient.delete(endpoints.users.member(workspaceId, userId))
  },

  async leave(workspaceId: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay(220)
      return
    }

    await httpClient.delete(endpoints.users.leave(workspaceId))
  },
}
