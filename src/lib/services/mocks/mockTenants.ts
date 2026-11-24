import type { PageResponse } from '#/lib/types/api'
import type { GetTenantsQuery, TenantResponse } from '#/lib/types/workspace'

const MOCK_TENANTS_KEY = 'cqa_mock_tenants'
const MOCK_INVITATION_KEY = 'cqa_mock_workspace_invitation_accepted'

const INITIAL_TENANTS: TenantResponse[] = [
  {
    id: 'demo-workspace',
    name: 'Workspace Demo',
    slug: 'workspace-demo',
    settings: 'Thiết lập demo',
    myRole: 'ADMIN',
    channelsCount: 3,
    unreadMessagesCount: 12,
  },
]

function readMockTenants(): TenantResponse[] {
  try {
    const stored = localStorage.getItem(MOCK_TENANTS_KEY)
    return stored ? JSON.parse(stored) as TenantResponse[] : INITIAL_TENANTS
  } catch {
    return INITIAL_TENANTS
  }
}

function writeMockTenants(tenants: TenantResponse[]) {
  localStorage.setItem(MOCK_TENANTS_KEY, JSON.stringify(tenants))
}

export function createMockTenant(name: string, slug: string): TenantResponse {
  const tenant: TenantResponse = {
    id: `workspace-${Date.now()}`,
    name,
    slug,
    settings: 'Thiết lập demo',
    myRole: 'OWNER',
    channelsCount: 0,
    unreadMessagesCount: 0,
  }
  writeMockTenants([...readMockTenants(), tenant])
  return tenant
}

export function acceptMockWorkspaceInvitation(): TenantResponse {
  const existing = readMockTenants().find((tenant) => tenant.id === 'invited-workspace')
  if (existing) return existing

  localStorage.setItem(MOCK_INVITATION_KEY, 'true')
  const tenant: TenantResponse = {
    id: 'invited-workspace',
    name: 'Gom Support',
    slug: 'gom-support',
    settings: 'Workspace được mời tham gia',
    myRole: 'MEMBER',
    channelsCount: 2,
    unreadMessagesCount: 4,
  }
  writeMockTenants([...readMockTenants(), tenant])
  return tenant
}

export function hasAcceptedMockWorkspaceInvitation(): boolean {
  return localStorage.getItem(MOCK_INVITATION_KEY) === 'true'
}

export function getMockTenants({
  page,
  limit,
}: GetTenantsQuery): PageResponse<TenantResponse> {
  const tenants = readMockTenants()
  const start = (page - 1) * limit

  return {
    page,
    total: tenants.length,
    pageSize: limit,
    limit,
    data: tenants.slice(start, start + limit),
  }
}
