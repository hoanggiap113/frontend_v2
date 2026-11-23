import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface FieldWrapperProps {
  label: string
  error?: string
  hasError?: boolean
  children: ReactNode
  extra?: ReactNode
}

export function FieldWrapper({
  label,
  error,
  hasError,
  children,
  extra,
}: FieldWrapperProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </label>
        {extra}
      </div>

      <div
        className={clsx(
          'flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 transition-all',
          'focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-100',
          hasError || error ? 'border-red-300 bg-red-50' : 'border-slate-200',
        )}
      >
        {children}
      </div>

      {error && (
        <p className="flex items-center gap-1 p-1 text-xs text-red-500">
          {error} <span>!</span>
        </p>
      )}
    </div>
  )
}

