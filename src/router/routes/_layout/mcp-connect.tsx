import MCPConnectionsPage from '#/features/mcp/MCPConnectionsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/mcp-connect')({
  component: MCPConnectionsPage,
})
