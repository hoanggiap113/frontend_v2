import { createFileRoute } from '@tanstack/react-router'
import JobEditPage from '#/features/jobs/pages/JobEditPage'

export const Route = createFileRoute('/_layout/jobs/$jobId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { jobId } = Route.useParams()
  return <JobEditPage jobId={jobId} />
}
