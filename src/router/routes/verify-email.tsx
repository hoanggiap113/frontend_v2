import { createFileRoute, redirect } from '@tanstack/react-router'
import { readAccessToken } from '#/lib/browser-storage'
import VerifyEmailPage from '#/features/auth/pages/VerifyEmailPage'

export const Route = createFileRoute('/verify-email')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && readAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: VerifyEmailPage,
})
