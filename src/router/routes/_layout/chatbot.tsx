import ChatBotPage from '#/features/chatbot/ChatBotPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/chatbot')({
  component: ChatBotPage,
})
