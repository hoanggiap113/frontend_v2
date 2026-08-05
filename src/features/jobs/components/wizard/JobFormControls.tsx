import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export function FieldLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-sm font-medium text-slate-700">{children}</div>
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    />
  )
}

export function StepDescription({ children }: { children: ReactNode }) {
  return <div className="text-sm text-slate-500">{children}</div>
}

export function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={clsx(
        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
        selected ? 'border-slate-900' : 'border-slate-400',
      )}
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />}
    </span>
  )
}

export function SummaryRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-slate-100 last:border-b-0">
      <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
        {label}
      </div>
      <div className="px-4 py-3 text-sm text-slate-700">{value}</div>
    </div>
  )
}
