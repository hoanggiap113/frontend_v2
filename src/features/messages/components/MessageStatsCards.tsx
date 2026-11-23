import {
  Activity,
  Bot,
  MessageSquareText,
  Paperclip,
} from '#/components/ui/icons'
import type { AppIcon } from '#/components/ui/icons'
import {
  buildBusinessMessageStats,
} from '../../../lib/helpers/message-stats-helper'
import type {
  MessageStatIconKey,
  MessageStatTone,
} from '../../../lib/helpers/message-stats-helper'
import type { ConversationItem } from '../../../lib/types/message'

const statToneClass: Record<
  MessageStatTone,
  { card: string; icon: string; glow: string }
> = {
  emerald: {
    card: 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70',
    icon: 'bg-emerald-100 text-emerald-700',
    glow: 'bg-emerald-400/10',
  },
  indigo: {
    card: 'border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70',
    icon: 'bg-indigo-100 text-indigo-700',
    glow: 'bg-indigo-400/10',
  },
  slate: {
    card: 'border-slate-200 bg-gradient-to-br from-white to-slate-50',
    icon: 'bg-slate-100 text-slate-700',
    glow: 'bg-slate-400/10',
  },
}

const statIconByKey: Record<MessageStatIconKey, AppIcon> = {
  activity: Activity,
  bot: Bot,
  message: MessageSquareText,
  paperclip: Paperclip,
}

export function MessageStatsCards({
  conversations,
}: {
  conversations: ConversationItem[]
}) {
  const stats = buildBusinessMessageStats(conversations)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const tone = statToneClass[item.tone]
        const Icon = statIconByKey[item.iconKey]

        return (
          <div
            key={item.label}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ${tone.card}`}
          >
            <div
              className={`absolute -right-8 -top-8 size-24 rounded-full blur-2xl ${tone.glow}`}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-500">
                  {item.label}
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {item.value}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-400">
                  {item.note}
                </div>
              </div>
              <div
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone.icon}`}
              >
                <Icon size={20} strokeWidth={2.2} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
