export interface MCPConnectionItem {
  id: string
  name: string
  clientId: string
  scopes: string[]
  redirectUris: string[]
  status: 'active' | 'revoked' | 'draft'
  lastUsedAt: string
}

export const mcpSummary = [
  { label: 'Client đang hoạt động', value: '4', note: '2 Claude Desktop' },
  { label: 'Scope đang cấp', value: '7', note: 'Read / write / export' },
  { label: 'Lượt truy cập 24h', value: '216', note: 'Tăng 14%' },
  { label: 'Token hợp lệ', value: '32', note: '0 token hết hạn' },
]

export const mockMCPConnections: MCPConnectionItem[] = [
  {
    id: 'mcp_001',
    name: 'Claude Desktop - QA Team',
    clientId: 'cqa_claude_desktop',
    scopes: ['read:conversations', 'read:results', 'write:notes'],
    redirectUris: ['http://localhost:53123/callback'],
    status: 'active',
    lastUsedAt: '14/04/2026 15:02',
  },
  {
    id: 'mcp_002',
    name: 'Claude Web - Manager',
    clientId: 'cqa_claude_web',
    scopes: ['read:dashboard', 'read:results'],
    redirectUris: ['https://app.anthropic.com/oauth/callback'],
    status: 'active',
    lastUsedAt: '14/04/2026 13:47',
  },
  {
    id: 'mcp_003',
    name: 'Internal Testing',
    clientId: 'cqa_internal_test',
    scopes: ['read:all'],
    redirectUris: ['http://localhost:3001/callback'],
    status: 'draft',
    lastUsedAt: 'Chưa dùng',
  },
]
