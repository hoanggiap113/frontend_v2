import { formatDateTime, formatTime } from '#/shared/lib/datetime-helper'
import type { JobItem, JobResultItem, JobStatus, JobType } from '../types/job'

export const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  draft: 'bg-amber-50 text-amber-700',
}

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  qc_analysis: 'QC Analysis',
  classification: 'Classification',
  auto_reply: 'Auto Reply',
  routing: 'Routing',
}

export const JOB_RESULT_SEVERITY_STYLES: Record<
  JobResultItem['severity'],
  string
> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-rose-50 text-rose-700',
  critical: 'bg-red-100 text-red-700',
}

export function formatJobLastRun(lastRunAt: string | null) {
  return formatDateTime(lastRunAt, 'Chưa chạy')
}

export function formatJobRunFinishedAt(finishedAt: string | null) {
  return finishedAt ? formatTime(finishedAt) : 'Đang chạy'
}

const WEEKDAY_LABELS: Record<string, string> = {
  '0': 'Chủ nhật',
  '1': 'Thứ hai',
  '2': 'Thứ ba',
  '3': 'Thứ tư',
  '4': 'Thứ năm',
  '5': 'Thứ sáu',
  '6': 'Thứ bảy',
  '7': 'Chủ nhật',
}

function normalizeCronParts(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 5) return ['0', ...parts]
  return parts
}

function formatCronTime(hour: string, minute: string) {
  const hourNumber = Number(hour)
  const minuteNumber = Number(minute)
  if (!Number.isInteger(hourNumber) || !Number.isInteger(minuteNumber)) {
    return null
  }

  return `${String(hourNumber).padStart(2, '0')}:${String(minuteNumber).padStart(2, '0')}`
}

export function formatJobSchedule(
  scheduleType: JobItem['scheduleType'],
  scheduleValue: string,
) {
  if (scheduleType === 'after_sync') return 'Chạy thủ công sau khi sync'
  if (scheduleType === 'realtime') return 'Realtime'

  const parts = normalizeCronParts(scheduleValue)
  if (parts.length !== 6) return scheduleValue || 'Chưa cấu hình'

  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts
  if (second !== '0' || month !== '*') return scheduleValue

  const time = formatCronTime(hour, minute)
  if (!time) return scheduleValue

  if (dayOfMonth === '*' && dayOfWeek === '*') {
    return `Hàng ngày lúc ${time}`
  }

  if (dayOfMonth === '*' && WEEKDAY_LABELS[dayOfWeek]) {
    return `Hàng tuần vào ${WEEKDAY_LABELS[dayOfWeek]} lúc ${time}`
  }

  if (/^\d+$/.test(dayOfMonth) && dayOfWeek === '*') {
    return `Ngày ${dayOfMonth} hàng tháng lúc ${time}`
  }

  return scheduleValue
}
