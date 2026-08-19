import { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { App } from 'antd'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (input: ToastInput) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { notification } = App.useApp()
  const seed = useRef(0)

  const dismiss = useCallback(
    (id: number) => {
      notification.destroy(String(id))
    },
    [notification],
  )

  const toast = useCallback(
    ({ title, description, variant = 'info', duration = 4000 }: ToastInput) => {
      const id = ++seed.current
      notification[variant]({
        key: String(id),
        message: title,
        description,
        duration: duration <= 0 ? 0 : duration / 1000,
        placement: 'topRight',
        showProgress: duration > 0,
      })
      return id
    },
    [notification],
  )

  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
