import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitationPage } from '#/features/invitations/pages'

export const Route = createFileRoute('/invitations/$token/accept')({
  component: InvitationAcceptRoute,
})

function InvitationAcceptRoute() {
  const { token } = Route.useParams()
  return <AcceptInvitationPage token={token} />
}
