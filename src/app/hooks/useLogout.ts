import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { App } from 'antd'
import { authService } from '#/lib/services/authService'
import { useCurrentTenant } from '../providers/TenantProvider'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const { selectTenant } = useCurrentTenant()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    if (loggingOut) return

    setLoggingOut(true)
    try {
      const response = await authService.logout()
      if (!response.success) throw new Error('Logout failed.')
    } catch {
      message.error('Không thể kết thúc phiên trên máy chủ. Vui lòng thử lại.')
      return
    } finally {
      setLoggingOut(false)
    }

    selectTenant(null)
    queryClient.clear()
    await navigate({ to: '/auth', search: { mode: 'login' }, replace: true })
  }

  return { loggingOut, logout }
}
