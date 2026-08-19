import { createFileRoute, redirect } from '@tanstack/react-router'
import { readAccessToken } from '#/lib/browser-storage'
import RegisterPage from '#/features/auth/pages/RegisterPage'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && readAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

