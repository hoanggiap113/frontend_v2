import ChannelDetailPage from '#/features/channels/ChannelDetailPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/channels/$channelId')({
  component: ChannelDetailComponent,
})

function ChannelDetailComponent() {
  const { channelId } = Route.useParams()
  return <ChannelDetailPage channelId={channelId} />
}
