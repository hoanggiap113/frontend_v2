import { useState } from 'react'
import {
  CheckCircle2,
  Eye,
  MessageSquare,
  ScrollText,
  Settings2,
  X,
} from '#/components/ui/icons'
import type { AppIcon } from '#/components/ui/icons'
import ScrollArea from '#/components/ui/ScrollArea'
import { getChannelTypeLabel } from '#/lib/helpers/channel-helper'

export interface SelectedJobChannel {
  id: string
  name: string
  type?: 'zalo_oa' | 'facebook' | 'pancake'
}

export default function JobConfigurationPanel({
  channels,
  outputs,
  rules,
}: {
  channels: SelectedJobChannel[]
  outputs: string[]
  rules: string[]
}) {
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const previewRules = rules.slice(0, 3)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Cấu hình đánh giá
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Kênh dữ liệu, quy tắc AI và đầu ra của tác vụ.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
          <Settings2 size={13} />
          {channels.length} kênh · {rules.length} quy tắc · {outputs.length} đầu ra
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ConfigBlock icon={MessageSquare} title="Kênh chat được đánh giá">
          <div className="space-y-2">
            {channels.length > 0 ? (
              channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-emerald-900">
                      {channel.name}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {channel.type
                        ? getChannelTypeLabel(channel.type)
                        : 'Không rõ loại kênh'}
                    </div>
                  </div>
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-emerald-500"
                  />
                </div>
              ))
            ) : (
              <EmptyLine text="Tác vụ AI chưa chọn kênh chat." />
            )}
          </div>
        </ConfigBlock>

        <ConfigBlock icon={CheckCircle2} title="Đầu ra sau đánh giá">
          <div className="flex flex-wrap gap-2">
            {outputs.length > 0 ? (
              outputs.map((output) => (
                <span
                  key={output}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"
                >
                  <CheckCircle2 size={15} />
                  {output}
                </span>
              ))
            ) : (
              <EmptyLine text="Tác vụ AI chưa cấu hình đầu ra." />
            )}
          </div>
        </ConfigBlock>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle icon={ScrollText} title="Quy tắc cho AI" />
          <button
            type="button"
            onClick={() => setIsRuleDialogOpen(true)}
            disabled={rules.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eye size={14} />
            Xem toàn bộ quy tắc
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {previewRules.length > 0 ? (
            previewRules.map((rule, index) => (
              <RulePreviewItem key={`${rule}-${index}`} index={index} rule={rule} />
            ))
          ) : (
            <EmptyLine text="Tác vụ AI chưa có quy tắc đánh giá." />
          )}
        </div>

        {rules.length > previewRules.length ? (
          <div className="mt-3 text-xs font-medium text-slate-400">
            Còn {rules.length - previewRules.length} quy tắc khác. Mở popup để
            xem đầy đủ nội dung.
          </div>
        ) : null}
      </div>

      {isRuleDialogOpen ? (
        <RuleDialog rules={rules} onClose={() => setIsRuleDialogOpen(false)} />
      ) : null}
    </section>
  )
}

function ConfigBlock({
  children,
  icon,
  title,
}: {
  children: React.ReactNode
  icon: AppIcon
  title: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <SectionTitle icon={icon} title={title} />
      <div className="mt-3">{children}</div>
    </div>
  )
}

function RulePreviewItem({ index, rule }: { index: number; rule: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 text-sm leading-6 text-slate-700">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
        {index + 1}
      </span>
      <span className="line-clamp-2">{rule}</span>
    </div>
  )
}

function RuleDialog({
  onClose,
  rules,
}: {
  onClose: () => void
  rules: string[]
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-rule-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3
              id="job-rule-dialog-title"
              className="text-base font-bold text-slate-800"
            >
              Quy tắc đánh giá AI
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Toàn bộ quy tắc đang được tác vụ AI dùng khi đánh giá hội thoại.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Đóng popup quy tắc"
          >
            <X size={16} />
          </button>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-5 py-4">
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={`${rule}-${index}`}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-500 shadow-sm">
                  {index + 1}
                </span>
                <span className="whitespace-pre-wrap">{rule}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400">
      {text}
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: AppIcon
  title: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
      <Icon size={14} className="text-slate-500" />
      {title}
    </div>
  )
}
