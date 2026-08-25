import PlaceholderPage from '#/router/components/PlaceholderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/chatbot')({
  component: () => <PlaceholderPage title="Chatbot" />,
})
