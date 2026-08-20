import { createFileRoute, redirect } from '@tanstack/react-router'
import { hasStoredSession } from '#/lib/browser-storage'
import RegisterPage from '#/features/auth/pages/RegisterPage'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && hasStoredSession()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})
