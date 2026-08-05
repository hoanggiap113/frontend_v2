import { createFileRoute, redirect } from '@tanstack/react-router'
import { readAccessToken } from '#/shared/lib/browser-storage'
import { RegisterPage } from '#/features/auth/pages'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && readAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})
