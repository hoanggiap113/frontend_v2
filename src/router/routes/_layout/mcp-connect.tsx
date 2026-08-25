import PlaceholderPage from '#/router/components/PlaceholderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/mcp-connect')({
  component: () => <PlaceholderPage title="Kết nối MCP" />,
})
