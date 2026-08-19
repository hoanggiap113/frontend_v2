export function formatDateTime(
  iso: string | null | undefined,
  fallback = 'Chưa đồng bộ',
) {
  if (!iso) return fallback

  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(
  iso: string | null | undefined,
  fallback = 'Chưa có dữ liệu',
) {
  if (!iso) return fallback
  return new Date(iso).toLocaleDateString('vi-VN')
}

export function formatTime(
  iso: string | null | undefined,
  fallback = 'Chưa có dữ liệu',
) {
  if (!iso) return fallback
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrentFullDate() {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCurrentTime() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getCurrentYear() {
  return new Date().getFullYear()
}

export function formatDuration(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
