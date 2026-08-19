import { createFileRoute } from '@tanstack/react-router'
import JobCreatePage from '#/features/jobs/pages/JobCreatePage'

export const Route = createFileRoute('/_layout/jobs/create')({
  component: JobCreatePage,
})
