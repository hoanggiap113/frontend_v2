import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { isMockMode } from '#/lib/config/env'
import InternalServerPage from './InternalServerPage'

export default function InternalServerRedirect() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const mockMode = isMockMode()

  useEffect(() => {
    if (!mockMode && pathname !== '/500') {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
      window.location.replace(`/500?from=${encodeURIComponent(currentPath)}`)
    }
  }, [mockMode, pathname])

  if (pathname === '/500') return <InternalServerPage />

  if (mockMode) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7f4] px-6 text-center">
        <div role="alert">
          <h1 className="text-lg font-bold text-slate-900">Không thể tải trang</h1>
          <p className="mt-2 text-sm text-slate-600">
            Đã xảy ra lỗi khi hiển thị trang này. Vui lòng thử tải lại.
          </p>
        </div>
      </main>
    )
  }

  return <div className="min-h-screen bg-[#f5f7f4]" aria-live="polite" />
}
