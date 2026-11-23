import { createFileRoute } from '@tanstack/react-router'
import InternalServerPage from '#/components/errors/InternalServerPage'

export const Route = createFileRoute('/500')({
  component: InternalServerPage,
})
