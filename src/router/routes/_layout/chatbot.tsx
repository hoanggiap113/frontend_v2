import { ChatBotPage } from '#/features/chatbot/pages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/chatbot')({
  component: ChatBotPage,
})
