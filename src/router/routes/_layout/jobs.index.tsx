import { createFileRoute } from '@tanstack/react-router'
import { JobsListPage } from '#/features/jobs/pages'

export const Route = createFileRoute('/_layout/jobs/')({
  component: JobsListPage,
})
