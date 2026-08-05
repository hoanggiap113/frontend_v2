import { MessagesPage } from '#/features/messages/pages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/messages')({
  component: MessagesPage,
})
