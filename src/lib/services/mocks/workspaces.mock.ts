import type { Workspace } from '../../types/workspace'

export const workspaceSummary = [
  { label: 'Workspace đang hoạt động', value: '3', note: '1 trial / 2 paid' },
  { label: 'Tổng kênh đã kết nối', value: '12', note: 'Facebook + Zalo OA' },
  { label: 'Job đang bật', value: '27', note: '6 job realtime' },
  { label: 'Thành viên', value: '31', note: '8 admin / lead' },
]

export const mockWorkspaces: Workspace[] = [
  {
    id: 'tenant_001',
    name: 'SePay Coffee',
    slug: 'sepay-coffee',
    channelsCount: 4,
    jobsCount: 9,
    membersCount: 12,
    status: 'active',
    plan: 'growth',
    createdAt: '2026-02-01T02:00:00Z',
  },
  {
    id: 'tenant_002',
    name: 'Coffee Shop OA',
    slug: 'coffee-shop-oa',
    channelsCount: 3,
    jobsCount: 8,
    membersCount: 9,
    status: 'trial',
    plan: 'starter',
    createdAt: '2026-03-12T04:30:00Z',
  },
  {
    id: 'tenant_003',
    name: 'BlueGift B2B',
    slug: 'bluegift-b2b',
    channelsCount: 5,
    jobsCount: 10,
    membersCount: 10,
    status: 'active',
    plan: 'enterprise',
    createdAt: '2026-01-20T08:15:00Z',
  },
]
