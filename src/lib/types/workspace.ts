export type TenantRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Workspace {
  id: string
  name: string
  slug: string
  channelsCount: number
  jobsCount: number
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
  myRole: TenantRole
  createdAt: string
}
