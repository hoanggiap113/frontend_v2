import { createFileRoute, redirect } from '@tanstack/react-router'
import { readAccessToken } from '#/shared/lib/browser-storage'
import { LoginPage } from '#/features/auth/pages'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && readAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})
