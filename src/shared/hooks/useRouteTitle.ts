import { useRouterState } from '@tanstack/react-router'

const ROUTE_TITLES: Array<{ match: RegExp; title: string }> = [
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

export function useRouteTitle(): string {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return ROUTE_TITLES.find((item) => item.match.test(pathname))?.title ?? 'Trang chủ'
}
