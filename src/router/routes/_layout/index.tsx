import { HomePage } from '#/features/dashboard/pages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})
