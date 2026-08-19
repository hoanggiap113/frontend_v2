import { createFileRoute } from '@tanstack/react-router'
import JobsListPage from '#/features/jobs/pages/JobsListPage'

export const Route = createFileRoute('/_layout/jobs/')({
  component: JobsListPage,
})
