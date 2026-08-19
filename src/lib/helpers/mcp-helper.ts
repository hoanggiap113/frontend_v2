import type { MCPConnectionItem } from '../services/mocks/mcp.mock'

export const MCP_STATUS_STYLES: Record<MCPConnectionItem['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700',
  revoked: 'bg-rose-50 text-rose-700',
  draft: 'bg-amber-50 text-amber-700',
}
