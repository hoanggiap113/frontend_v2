import UsersPage from '#/features/users/UsersPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/users')({
  component: UsersPage,
})
