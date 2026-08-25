import { createFileRoute } from '@tanstack/react-router'
import PlaceholderPage from '#/router/components/PlaceholderPage'

export const Route = createFileRoute('/invitations/$token/accept')({
  component: () => <PlaceholderPage title="Chấp nhận lời mời" />,
})
