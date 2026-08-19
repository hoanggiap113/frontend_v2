export interface UserItem {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  team: string
  status: 'online' | 'away' | 'offline'
  workload: number
  permissions: string[]
}

export const userStats = [
  { label: 'Tổng thành viên', value: '18', note: '3 admin' },
  { label: 'Đang online', value: '11', note: '2 người trực đêm' },
  { label: 'Nhóm CSKH', value: '9', note: '4 Facebook / 5 Zalo' },
  { label: 'Rule phân quyền', value: '12', note: 'Theo vai trò + custom' },
]

export const mockUsers: UserItem[] = [
  {
    id: 'u_001',
    name: 'Nguyễn Thu Hà',
    email: 'thuha@company.ai',
    role: 'owner',
    team: 'Operations',
    status: 'online',
    workload: 18,
    permissions: ['channels:rw', 'messages:rw', 'jobs:rw', 'settings:rw'],
  },
  {
    id: 'u_002',
    name: 'Trần Bảo Trâm',
    email: 'baotram@company.ai',
    role: 'admin',
    team: 'CSKH',
    status: 'online',
    workload: 24,
    permissions: ['messages:rw', 'jobs:rw', 'notifications:r'],
  },
  {
    id: 'u_003',
    name: 'Phạm Minh Châu',
    email: 'minhchau@company.ai',
    role: 'member',
    team: 'Sales',
    status: 'away',
    workload: 11,
    permissions: ['messages:rw', 'channels:r'],
  },
  {
    id: 'u_004',
    name: 'Lê Tú Anh',
    email: 'tuanh@company.ai',
    role: 'member',
    team: 'CSKH',
    status: 'offline',
    workload: 0,
    permissions: ['messages:r', 'jobs:r'],
  },
]

export const permissionFeatures = [
  'channels',
  'messages',
  'jobs',
  'notifications',
  'settings',
  'logs',
]
