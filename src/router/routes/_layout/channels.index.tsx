import { ChannelsPage } from '#/features/channels/pages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/channels/')({
  component: ChannelsPage,
})
