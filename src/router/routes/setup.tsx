import { createFileRoute, redirect } from '@tanstack/react-router'
import { readAccessToken } from '#/shared/lib/browser-storage'
import { SetupPage } from '#/features/auth/pages'

export const Route = createFileRoute('/setup')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && readAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: SetupPage,
})
