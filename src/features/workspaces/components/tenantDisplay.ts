import type { Workspace } from '../../../lib/types/workspace'

export const planLabel: Record<Workspace['plan'], string> = {
  enterprise: 'Enterprise',
  growth: 'Growth',
  starter: 'Starter',
}

export const statusLabel: Record<Workspace['status'], string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  trial: 'Dùng thử',
}
