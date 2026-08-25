export type TenantRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type GetTenantsQuery = {
  page: number
  limit: number
}

export interface Workspace {
  id: string
  name: string
  slug: string
  membersCount: number
  status: 'active' | 'trial' | 'paused'
  plan: 'starter' | 'growth' | 'enterprise'
  myRole?: TenantRole
  createdAt: string
}

export interface TenantResponse {
  id: string
  name: string
  slug: string
  settings: string
}
