import type { ReactNode } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from '#/components/ui/icons'
import type { AppIcon } from '#/components/ui/icons'
import { clsx } from 'clsx'

export type NotificationDialogType = 'info' | 'success' | 'warning' | 'danger'

type NotificationDialogProps = {
  isOpen: boolean
  type?: NotificationDialogType
  title: ReactNode
  message?: ReactNode
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onClose: () => void
  confirmDisabled?: boolean
  confirmLoading?: boolean
  closeOnBackdrop?: boolean
}

const dialogConfig: Record<
  NotificationDialogType,
  {
    icon: AppIcon
    iconClassName: string
    confirmClassName: string
  }
> = {
  info: {
    icon: Info,
    iconClassName: 'bg-blue-50 text-blue-600 border-blue-100',
    confirmClassName: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-100',
  },
  success: {
    icon: CheckCircle2,
    iconClassName: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    confirmClassName:
      'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-100',
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'bg-amber-50 text-amber-600 border-amber-100',
    confirmClassName: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-100',
  },
  danger: {
    icon: AlertCircle,
    iconClassName: 'bg-red-50 text-red-600 border-red-100',
    confirmClassName: 'bg-red-500 hover:bg-red-600 focus:ring-red-100',
  },
}

export default function NotificationDialog({
  isOpen,
  type = 'info',
  title,
  message,
  children,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  onConfirm,
  onClose,
  confirmDisabled = false,
  confirmLoading = false,
  closeOnBackdrop = true,
}: NotificationDialogProps) {
  if (!isOpen) return null

  const config = dialogConfig[type]
  const Icon = config.icon
  const hasConfirmAction = Boolean(onConfirm)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget &&
          !confirmLoading
        ) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={confirmLoading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Đóng thông báo"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={clsx(
              'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border',
              config.iconClassName,
            )}
          >
            <Icon size={22} />
          </div>

          <h3 className="text-base font-bold text-slate-800">{title}</h3>

          {message && (
            <div className="mt-2 text-sm leading-6 text-slate-500">
              {message}
            </div>
          )}

          {children && <div className="mt-4 w-full">{children}</div>}
        </div>

        <div className="mt-6 flex gap-3">
          {hasConfirmAction && (
            <button
              type="button"
              onClick={onClose}
              disabled={confirmLoading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={hasConfirmAction ? onConfirm : onClose}
            disabled={confirmDisabled || confirmLoading}
            className={clsx(
              'flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-4 disabled:pointer-events-none disabled:opacity-60',
              config.confirmClassName,
            )}
          >
            {confirmLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
