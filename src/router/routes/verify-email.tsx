import { createFileRoute, redirect } from '@tanstack/react-router'
import { hasStoredSession } from '#/lib/browser-storage'
import VerifyEmailPage from '#/features/auth/pages/VerifyEmailPage'

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  beforeLoad: () => {
    if (typeof window !== 'undefined' && hasStoredSession()) {
      throw redirect({ to: '/' })
    }
  },
  component: VerifyEmailPage,
})
