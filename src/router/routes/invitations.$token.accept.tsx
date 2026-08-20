import { createFileRoute } from '@tanstack/react-router'
import AcceptInvitationPage from '#/features/invitations/AcceptInvitationPage'

export const Route = createFileRoute('/invitations/$token/accept')({
  beforeLoad: () => {
    
  },
  component: InvitationAcceptRoute,
})

function InvitationAcceptRoute() {
  const { token } = Route.useParams()
  return <AcceptInvitationPage token={token} />
}
