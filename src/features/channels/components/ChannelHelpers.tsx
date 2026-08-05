import { clsx } from 'clsx'
import {
  CHANNEL_STATUS_LABEL,
  CHANNEL_TYPE_LABEL,
  SYNC_STATUS_LABEL,
} from '../lib/channel-helper'
import type {
  ChannelStatus,
  ChannelType,
  SyncStatus,
} from '../types/channel'

interface BadgeProps {
  label: string
  className?: string
}

function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className,
      )}
    >
      {label}
    </span>
  )
}

export function ChannelTypeBadge({ type }: { type: ChannelType }) {
  const className: Record<ChannelType, string> = {
    zalo_oa: 'bg-blue-100 text-blue-700',
    facebook: 'bg-indigo-100 text-indigo-700',
    pancake: 'bg-orange-100 text-orange-700',
  }

  return (
    <Badge
      label={CHANNEL_TYPE_LABEL[type]}
      className={className[type]}
    />
  )
}

export function ChannelStatusBadge({ status }: { status: ChannelStatus }) {
  const className: Record<ChannelStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-500',
    error: 'bg-red-100 text-red-600',
  }

  return <Badge label={CHANNEL_STATUS_LABEL[status]} className={className[status]} />
}

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const className: Record<SyncStatus, string> = {
    synced: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    never: 'bg-slate-100 text-slate-500',
    failed: 'bg-red-100 text-red-600',
  }

  return <Badge label={SYNC_STATUS_LABEL[status]} className={className[status]} />
}
