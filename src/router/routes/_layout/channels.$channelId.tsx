import PlaceholderPage from '#/router/components/PlaceholderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/channels/$channelId')({
  component: ChannelDetailComponent,
})

function ChannelDetailComponent() {
  return <PlaceholderPage title="Chi tiết kênh chat" />
}
