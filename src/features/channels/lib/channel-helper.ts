import type {
  Channel,
  ChannelStatus,
  ChannelType,
  SyncStatus,
} from '../types/channel'

export const CHANNEL_TYPE_LABEL: Record<ChannelType, string> = {
  zalo_oa: 'Zalo OA',
  facebook: 'Facebook',
  pancake: 'Pancake',
}

export const CHANNEL_TYPE_OPTIONS: { value: ChannelType; label: string }[] = [
  { value: 'facebook', label: 'Facebook Fanpage' },
  { value: 'pancake', label: 'Pancake' },
]

export const SYNC_INTERVAL_OPTIONS: { value: string; label: string }[] = [
  { value: '5', label: 'Mỗi 5 phút' },
  { value: '15', label: 'Mỗi 15 phút (mặc định)' },
  { value: '30', label: 'Mỗi 30 phút' },
  { value: '60', label: 'Mỗi 60 phút' },
]

export const CHANNEL_STATUS_LABEL: Record<ChannelStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Tạm dừng',
  error: 'Lỗi',
}

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  synced: 'Đã đồng bộ',
  pending: 'Đang đồng bộ',
  never: 'Chưa đồng bộ',
  failed: 'Thất bại',
}

export function getChannelTypeLabel(type: ChannelType) {
  return CHANNEL_TYPE_LABEL[type]
}

export function filterChannels(channels: Channel[], search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return channels

  return channels.filter((channel) => {
    const typeLabel = getChannelTypeLabel(channel.type).toLowerCase()
    return (
      channel.name.toLowerCase().includes(query) ||
      channel.type.toLowerCase().includes(query) ||
      typeLabel.includes(query)
    )
  })
}
