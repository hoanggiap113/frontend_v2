import { createFileRoute } from '@tanstack/react-router'
import { JobCreatePage } from '#/features/jobs/pages'

export const Route = createFileRoute('/_layout/jobs/create')({
  component: JobCreatePage,
})
