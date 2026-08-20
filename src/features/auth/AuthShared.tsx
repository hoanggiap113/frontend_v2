import type {ReactNode} from 'react';
import { Bot } from '#/components/ui/icons'
import { clsx } from 'clsx'
import { getCurrentYear } from '#/lib/helpers/datetime-helper'

export function AuthBrand() {
  return (
    <div className="text-center mb-8">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
        <Bot size={24} className="text-white" />
      </div>
      <h1 className="text-2xl font-extrabold text-emerald-600 tracking-tight">
        AI Admin
      </h1>
      <p className="text-sm text-slate-500 mt-1">Chat Quality Agent</p>
    </div>
  )
}

export function AuthFooter() {
  return (
    <p className="text-center text-xs text-slate-400 mt-6">
      © {getCurrentYear()} AI Admin · Chat Quality Agent
    </p>
  )
}

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
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
        {extra}
      </div>

      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-xl border bg-slate-50 transition-all',
          'focus-within:bg-white focus-within:border-emerald-400 focus-within:ring-3 focus-within:ring-emerald-100',
          hasError || error ? 'border-red-300 bg-red-50' : 'border-slate-200',
        )}
      >
        {children}
      </div>

      {error && (
        <p className="p-1 text-xs text-red-500 flex items-center gap-1">
          {error} <span>!</span>
        </p>
      )}
    </div>
  )
}

interface SubmitButtonProps {
  loading?: boolean
  label: string
  loadingLabel?: string
}

export function SubmitButton({
  loading,
  label,
  loadingLabel = 'Đang xử lý...',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 mt-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  )
}
