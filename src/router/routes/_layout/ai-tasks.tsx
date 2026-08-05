import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/ai-tasks')({
  beforeLoad: () => {
    throw redirect({ to: '/jobs' })
  },
})
