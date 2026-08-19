import { endpoints } from '#/lib/services/endpoints'
import { clone, mockDelay } from '#/lib/utils'
import type { TenantResponse, Workspace } from '../types/workspace'
import { mockWorkspaces } from './mocks/workspaces.mock'
import { isMockMode } from '#/lib/env'
import { httpClient } from '#/lib/services/http/client'

let workspaceState = clone(mockWorkspaces)

function tenantToWorkspace(tenant: TenantResponse): Workspace {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    myRole: tenant.myRole,
    channelsCount: 0,
    jobsCount: 0,
    membersCount: 1,
    status: 'active',
    plan: 'starter',
    createdAt: tenant.createdAt,
  }
}

export const workspacesService = {
  async list(): Promise<Workspace[]> {
    if (isMockMode()) {
      await mockDelay()
      return clone(workspaceState)
    }
    const tenants = await httpClient.get<TenantResponse[]>(
      endpoints.workspaces.list,
    )
    return tenants.map(tenantToWorkspace)
  },
  async create(payload: Pick<Workspace, 'name' | 'slug'>): Promise<Workspace> {
    if (isMockMode()) {
      await mockDelay()
      const item: Workspace = {
        id: `tenant_${Date.now()}`,
        name: payload.name,
        slug: payload.slug,
        channelsCount: 0,
        jobsCount: 0,
        membersCount: 1,
        status: 'trial',
        plan: 'starter',
        createdAt: new Date().toISOString(),
      }
      workspaceState = [item, ...workspaceState]
      return clone(item)
    }
    const tenant = await httpClient.post<TenantResponse>(
      endpoints.workspaces.create,
      {
        name: payload.name,
      },
    )
    return tenantToWorkspace(tenant)
  },
  async remove(workspaceId: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay()
      workspaceState = workspaceState.filter((item) => item.id !== workspaceId)
      return
    }
    await httpClient.delete(endpoints.workspaces.detail(workspaceId))
  },
}
