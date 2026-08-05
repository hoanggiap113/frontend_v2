export function formatNumber(value: number) {
  return value.toLocaleString('vi-VN')
}

export function formatCompactNumber(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return formatNumber(value)
}

export function formatVnd(value: number) {
  return `₫${formatNumber(value)}`
}
