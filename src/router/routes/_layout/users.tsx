import { UsersPage } from '#/features/users/pages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/users')({
  component: UsersPage,
})
