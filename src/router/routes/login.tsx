import { createFileRoute, redirect } from '@tanstack/react-router'
import { hasStoredSession } from '#/lib/browser-storage'
import LoginPage from '#/features/auth/pages/LoginPage'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && hasStoredSession()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})
