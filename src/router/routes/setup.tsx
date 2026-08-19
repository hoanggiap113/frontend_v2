import { createFileRoute, redirect } from '@tanstack/react-router'
import { readAccessToken } from '#/lib/browser-storage'
import SetupPage from '#/features/auth/pages/SetupPage'

export const Route = createFileRoute('/setup')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && readAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: SetupPage,
})
