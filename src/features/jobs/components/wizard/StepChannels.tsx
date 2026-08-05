import { CheckCircle2 } from '#/shared/ui/icons'
import { clsx } from 'clsx'
import { StepDescription } from './JobFormControls'
import { getChannelTypeLabel } from '#/features/channels'
import type { JobChannelsStepProps } from '../../types/job-form'

export default function StepChannels({
  channels,
  form,
  toggleValue,
}: JobChannelsStepProps) {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Chọn kênh chat
        </h3>
        <StepDescription>
          Hệ thống sẽ lấy cuộc hội thoại từ các kênh này để phân tích.
        </StepDescription>
      </div>

      {channels.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          Chưa có kênh nào.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded border border-slate-200">
          {channels.map((channel) => {
            const selected = form.channels.includes(channel.id)
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => toggleValue('channels', channel.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <span
                  className={clsx(
                    'flex h-5 w-5 items-center justify-center rounded border',
                    selected
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-300 bg-white',
                  )}
                >
                  {selected && <CheckCircle2 size={13} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-900">
                    {channel.name}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {getChannelTypeLabel(channel.type)}
                    </span>
                    <span
                      className={clsx(
                        'rounded px-2 py-0.5 text-xs font-medium',
                        channel.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : channel.status === 'error'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {channel.status}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
