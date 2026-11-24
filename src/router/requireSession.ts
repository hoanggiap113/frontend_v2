import { redirect } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import type { QueryClient } from '@tanstack/react-query'
import { clearStoredTenant } from '#/app/providers/TenantProvider'
import { authService } from '#/lib/services/authService'

export const sessionQueryKey = ['auth', 'session'] as const

export async function requireSession(queryClient: QueryClient) {
  const authenticated = await queryClient.ensureQueryData({
    queryKey: sessionQueryKey,
    retry: false,
    queryFn: async () => {
      try {
        return (await authService.refreshToken()).success
      } catch (error) {
        if (
          isAxiosError(error) &&
          (!error.response || [401, 403].includes(error.response.status))
        ) {
          return false
        }
        throw error
      }
    },
  })

  if (!authenticated) {
    clearStoredTenant()
    throw redirect({ to: '/auth', search: { mode: 'login' }, replace: true })
  }
}
