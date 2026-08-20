import type { Workspace } from '../../types/workspace'

export const mockWorkspaces: Workspace[] = [
  {
    id: 'tenant_001',
    name: 'SePay Coffee',
    slug: 'sepay-coffee',
    membersCount: 12,
    status: 'active',
    plan: 'growth',
    createdAt: '2026-02-01T02:00:00Z',
  },
  {
    id: 'tenant_002',
    name: 'Coffee Shop OA',
    slug: 'coffee-shop-oa',
    membersCount: 9,
    status: 'trial',
    plan: 'starter',
    createdAt: '2026-03-12T04:30:00Z',
  },
  {
    id: 'tenant_003',
    name: 'BlueGift B2B',
    slug: 'bluegift-b2b',
    membersCount: 10,
    status: 'active',
    plan: 'enterprise',
    createdAt: '2026-01-20T08:15:00Z',
  },
]
