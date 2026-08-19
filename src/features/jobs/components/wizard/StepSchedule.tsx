import { useEffect, useMemo } from 'react'
import {
  aiProviderOptions,
  aiModelOptions,
  getAiModelOptions,
  scheduleOptions,
  scheduleValueFor,
} from '../jobFormConfig'
import {
  FieldLabel,
  RadioDot,
  StepDescription,
  TextInput,
} from './JobFormControls'
import { formatJobSchedule } from '../../../../lib/helpers/job-helper'
import type { JobStepBaseProps } from '../../../../lib/types/job-form'

type CronMode = 'daily' | 'weekly' | 'monthly' | 'custom'

const cronModeOptions: Array<{
  value: CronMode
  title: string
  description: string
}> = [
  {
    value: 'daily',
    title: 'Hàng ngày',
    description: 'Chạy tự động mỗi ngày vào giờ đã chọn.',
  },
  {
    value: 'weekly',
    title: 'Hàng tuần',
    description: 'Chạy vào một ngày cố định trong tuần.',
  },
  {
    value: 'monthly',
    title: 'Hàng tháng',
    description: 'Chạy vào một ngày cố định trong tháng.',
  },
  {
    value: 'custom',
    title: 'Tùy chỉnh nâng cao',
    description: 'Dùng cron expression khi cần lịch phức tạp.',
  },
]

const weekdayOptions = [
  { value: '1', label: 'Thứ hai' },
  { value: '2', label: 'Thứ ba' },
  { value: '3', label: 'Thứ tư' },
  { value: '4', label: 'Thứ năm' },
  { value: '5', label: 'Thứ sáu' },
  { value: '6', label: 'Thứ bảy' },
  { value: '0', label: 'Chủ nhật' },
]

const monthDayOptions = Array.from({ length: 31 }, (_, index) => {
  const day = String(index + 1)
  return { value: day, label: `Ngày ${day}` }
})

export default function StepSchedule({ form, setFormValue }: JobStepBaseProps) {
  const modelOptions = useMemo(
    () => getAiModelOptions(form.provider),
    [form.provider],
  )
  const fallbackModel = modelOptions[0]?.value ?? form.model
  const cronConfig = parseCronConfig(form.scheduleValue)

  useEffect(() => {
    const hasSelectedModel = modelOptions.some(
      (item) => item.value === form.model,
    )

    if (!hasSelectedModel) {
      setFormValue({ model: fallbackModel })
    }
  }, [fallbackModel, form.model, form.provider, modelOptions, setFormValue])

  const handleProviderChange = (provider: string) => {
    const nextModel =
      getAiModelOptions(provider)[0]?.value ??
      aiModelOptions[0]?.value ??
      form.model
    setFormValue({ provider, model: nextModel })
  }

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Lịch chạy</h3>
        <StepDescription>
          Chọn cách tác vụ AI được kích hoạt và model AI dùng để đánh giá hội
          thoại.
        </StepDescription>
      </div>

      <div>
        <FieldLabel>Lịch phân tích</FieldLabel>
        <div className="space-y-3">
          {scheduleOptions.map((item) => {
            const selected = form.scheduleType === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFormValue({
                    scheduleType: item.value,
                    scheduleValue: scheduleValueFor(item.value),
                  })
                }
                className="flex w-full items-start gap-3 rounded px-3 py-2 text-left transition-colors hover:bg-slate-50"
              >
                <RadioDot selected={selected} />
                <span>
                  <span className="block font-medium text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-400">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {form.scheduleType === 'cron' && false && (
        <label className="block max-w-md">
          <FieldLabel>Cron expression</FieldLabel>
          <TextInput
            value={form.scheduleValue}
            onChange={(scheduleValue) => setFormValue({ scheduleValue })}
            placeholder="0 0 7 * * *"
          />
          <div className="mt-1 text-xs text-slate-400">
            Cron gồm 6 trường. Ví dụ: 0 0 7 * * * nghĩa là
            chạy mỗi ngày lúc 7h.
          </div>
        </label>
      )}

      {form.scheduleType === 'cron' && (
        <CronScheduleBuilder
          cronConfig={cronConfig}
          scheduleValue={form.scheduleValue}
          onChange={(scheduleValue) => setFormValue({ scheduleValue })}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="block">
          <FieldLabel>Provider</FieldLabel>
          <div className="space-y-2">
            {aiProviderOptions.map((item) => {
              const selected = form.provider === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleProviderChange(item.value)}
                  className={`flex w-full items-start gap-3 rounded border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <RadioDot selected={selected} />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                      {item.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <label className="block">
          <FieldLabel>Model</FieldLabel>
          <select
            value={form.model}
            onChange={(event) => setFormValue({ model: event.target.value })}
            disabled={form.provider === 'CLAUDE'}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          >
            {modelOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-slate-400">
            {form.provider === 'CLAUDE'
              ? 'Claude dùng model cố định từ cấu hình backend .env.'
              : 'Gemini dùng API key từ cấu hình workspace hoặc hệ thống.'}
          </div>
        </label>
      </div>
    </section>
  )
}

function CronScheduleBuilder({
  cronConfig,
  onChange,
  scheduleValue,
}: {
  cronConfig: ReturnType<typeof parseCronConfig>
  onChange: (scheduleValue: string) => void
  scheduleValue: string
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <FieldLabel>Tần suất chạy</FieldLabel>
        <div className="grid gap-3 md:grid-cols-2">
          {cronModeOptions.map((item) => {
            const selected = cronConfig.mode === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  onChange(
                    buildCronValue({
                      ...cronConfig,
                      mode: item.value,
                    }),
                  )
                }
                className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                  selected
                    ? 'border-emerald-300 bg-white shadow-sm'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioDot selected={selected} />
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-400">
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {cronConfig.mode !== 'custom' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <FieldLabel>Giờ chạy</FieldLabel>
            <input
              type="time"
              value={cronConfig.time}
              onChange={(event) =>
                onChange(
                  buildCronValue({
                    ...cronConfig,
                    time: event.target.value,
                  }),
                )
              }
              className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          {cronConfig.mode === 'weekly' ? (
            <label className="block">
              <FieldLabel>Ngày trong tuần</FieldLabel>
              <select
                value={cronConfig.dayOfWeek}
                onChange={(event) =>
                  onChange(
                    buildCronValue({
                      ...cronConfig,
                      dayOfWeek: event.target.value,
                    }),
                  )
                }
                className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {weekdayOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {cronConfig.mode === 'monthly' ? (
            <label className="block">
              <FieldLabel>Ngày trong tháng</FieldLabel>
              <select
                value={cronConfig.dayOfMonth}
                onChange={(event) =>
                  onChange(
                    buildCronValue({
                      ...cronConfig,
                      dayOfMonth: event.target.value,
                    }),
                  )
                }
                className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {monthDayOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : (
        <label className="block max-w-md">
          <FieldLabel>Cron nâng cao</FieldLabel>
          <TextInput
            value={scheduleValue}
            onChange={onChange}
            placeholder="0 0 7 * * *"
          />
        </label>
      )}

      <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
        {formatJobSchedule('cron', scheduleValue)}
      </div>
    </div>
  )
}

function normalizeCronParts(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 5) return ['0', ...parts]
  return parts
}

function toTime(hour: string, minute: string) {
  const hourNumber = Number(hour)
  const minuteNumber = Number(minute)
  if (!Number.isInteger(hourNumber) || !Number.isInteger(minuteNumber)) {
    return '07:00'
  }

  return `${String(hourNumber).padStart(2, '0')}:${String(minuteNumber).padStart(2, '0')}`
}

function parseCronConfig(value: string): {
  mode: CronMode
  time: string
  dayOfWeek: string
  dayOfMonth: string
} {
  const parts = normalizeCronParts(value)
  if (parts.length !== 6) {
    return {
      mode: 'custom',
      time: '07:00',
      dayOfWeek: '1',
      dayOfMonth: '1',
    }
  }

  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts
  const time = toTime(hour, minute)

  if (
    second === '0' &&
    month === '*' &&
    dayOfMonth === '*' &&
    dayOfWeek === '*'
  ) {
    return { mode: 'daily', time, dayOfWeek: '1', dayOfMonth: '1' }
  }

  if (
    second === '0' &&
    month === '*' &&
    dayOfMonth === '*' &&
    /^\d+$/.test(dayOfWeek)
  ) {
    return { mode: 'weekly', time, dayOfWeek, dayOfMonth: '1' }
  }

  if (
    second === '0' &&
    month === '*' &&
    dayOfWeek === '*' &&
    /^\d+$/.test(dayOfMonth)
  ) {
    return { mode: 'monthly', time, dayOfWeek: '1', dayOfMonth }
  }

  return {
    mode: 'custom',
    time,
    dayOfWeek: /^\d+$/.test(dayOfWeek) ? dayOfWeek : '1',
    dayOfMonth: /^\d+$/.test(dayOfMonth) ? dayOfMonth : '1',
  }
}

function buildCronValue(config: {
  mode: CronMode
  time: string
  dayOfWeek: string
  dayOfMonth: string
}) {
  if (config.mode === 'custom') return '0 0 7 * * *'

  const [hour = '07', minute = '00'] = config.time.split(':')
  const normalizedHour = String(Number(hour)).padStart(2, '0')
  const normalizedMinute = String(Number(minute)).padStart(2, '0')

  if (config.mode === 'weekly') {
    return `0 ${normalizedMinute} ${normalizedHour} * * ${config.dayOfWeek}`
  }

  if (config.mode === 'monthly') {
    return `0 ${normalizedMinute} ${normalizedHour} ${config.dayOfMonth} * *`
  }

  return `0 ${normalizedMinute} ${normalizedHour} * * *`
}
