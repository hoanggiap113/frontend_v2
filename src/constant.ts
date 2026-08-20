export const STORAGE_KEYS = {
  user: 'cqa_user',
  currentTenant: 'cqa_current_tenant',
  knownUserNames: 'cqa_known_user_names',
} as const

export const LEGACY_AUTH_TOKEN_KEYS = [
  'cqa_access_token',
  'cqa_refresh_token',
] as const

export const LEGACY_TENANT_KEYS = [
  'cqa-current-tenant',
  'cqa_current_workspace',
  'cqa_workspace_id',
  'cqa_tenant_id',
] as const

export const LEGACY_AGENT_KEYS = [
  'cqa_user_id',
  'cqa_user_role',
  'cqa_username',
  'cqa_mock_tenant',
  'cqa_mock_user',
  'cqa_mock_role',
] as const

export const ROUTE_TITLES: Array<{ match: RegExp; title: string }> = [
  { match: /^\/$/, title: 'Trang chủ' },
  { match: /^\/tenants$/, title: 'Workspaces' },
  { match: /^\/channels(?:\/[^/]+)?$/, title: 'Kênh chat' },
  { match: /^\/messages$/, title: 'Tin nhắn' },
  { match: /^\/chatbot$/, title: 'Chatbot' },
  { match: /^\/jobs(?:\/create|\/[^/]+(?:\/edit)?)?$/, title: 'Tác vụ AI' },
  { match: /^\/ai-tasks$/, title: 'Tác vụ AI' },
  { match: /^\/activity-log$/, title: 'Audit log' },
  { match: /^\/system-log$/, title: 'Audit log' },
  { match: /^\/cost-log$/, title: 'Nhật ký chi phí' },
  { match: /^\/noti-history$/, title: 'Lịch sử thông báo' },
  { match: /^\/mcp-connect$/, title: 'Kết nối MCP' },
  { match: /^\/users$/, title: 'Người dùng' },
  { match: /^\/setup$/, title: 'Thiết lập ban đầu' },
]

export const CHATBOT_API_KEY_STORAGE = 'cqa_chatbot_api_key_config'
export const LEGACY_CHATBOT_API_KEY_STORAGE = CHATBOT_API_KEY_STORAGE
export const WAITING_APPROVAL_MARKER = '[SYSTEM_ACTION: WAITING_APPROVAL]'
export const APPROVAL_MARKERS = [
  WAITING_APPROVAL_MARKER,
  '[SYSTEM_ACTION: WAITING_DRAFT_APPROVAL]',
  '[SYSTEM_ACTION: WAITING_SAVE_APPROVAL]',
] as const
export const RULE_CONTENT_MARKER = '**Nội dung bộ quy tắc:**'
export const RULE_CONFIG_MARKER = '**rules_config:**'
export const APPROVAL_QUESTION_MARKER = 'Bạn có đồng ý'
export const PROCESSING_MESSAGE_PREFIX = 'processing_'

export const CHATBOT_API_KEY_GUIDE_URL =
  'https://www.youtube.com/watch?v=nCU3WmylYMA'
export const CHANNEL_PAGE_SIZE = 9
export const DEFAULT_DASHBOARD_RANGE_DAYS = 30
export const JOB_STATUS_POLL_INTERVAL_MS = 5000
export const DEFAULT_JOB_BUSINESS_CONTEXT =
  'Đây là cửa hàng demo, chuyên tư vấn và bán sản phẩm/dịch vụ cho khách hàng qua kênh chat.'

export const JOB_RULE_API_META = {
  low: { apiValue: 'LOW', weight: 1 },
  medium: { apiValue: 'MEDIUM', weight: 3 },
  high: { apiValue: 'HIGH', weight: 4 },
  critical: { apiValue: 'CRITICAL', weight: 5 },
} as const
