import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, Select, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  Bell, Bot, Building2, ClipboardList, DollarSign, Home, Mail,
  MessageSquare, MessagesSquare, Plug, Users, Workflow,
} from '#/components/ui/icons'
import { selectCurrentWorkspace, selectWorkspaces } from '#/app/store/index'
import { useAppDispatch, useAppSelector } from '#/app/store/hooks'
import { setCurrentWorkspaceId } from '#/features/workspaces'

interface NavigationItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Tổng quan', icon: <Home size={18} /> },
  { to: '/tenants', label: 'Workspaces', icon: <Building2 size={18} /> },
  { to: '/channels', label: 'Kênh chat', icon: <MessageSquare size={18} /> },
  { to: '/messages', label: 'Tin nhắn', icon: <Mail size={18} /> },
  { to: '/chatbot', label: 'Chatbot', icon: <MessagesSquare size={18} /> },
  { to: '/jobs', label: 'Tác vụ AI', icon: <Workflow size={18} /> },
  { to: '/activity-log', label: 'Audit log', icon: <ClipboardList size={18} /> },
  { to: '/cost-log', label: 'Nhật ký chi phí', icon: <DollarSign size={18} /> },
  { to: '/noti-history', label: 'Lịch sử thông báo', icon: <Bell size={18} /> },
  { to: '/mcp-connect', label: 'Kết nối MCP', icon: <Plug size={18} /> },
  { to: '/users', label: 'Người dùng', icon: <Users size={18} /> },
]

function getSelectedKey(pathname: string) {
  return (
    navigationItems.find((item) =>
      item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
    )?.to ?? '/'
  )
}

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const dispatch = useAppDispatch()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const workspaces = useAppSelector(selectWorkspaces)
  const currentWorkspace = useAppSelector(selectCurrentWorkspace)

  const menuItems: MenuProps['items'] = navigationItems.map((item) => ({
    key: item.to,
    icon: item.icon,
    label: <Link to={item.to}>{item.label}</Link>,
  }))

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'app-sidebar--collapsed' : ''}`}
    >
      <div className="app-sidebar__brand">
        <Tooltip
          title={collapsed ? 'Chat Quality Agent' : undefined}
          placement="right"
        >
          <div className="app-sidebar__logo">
            <Bot size={20} />
          </div>
        </Tooltip>
        {!collapsed ? (
          <div className="app-sidebar__brand-copy">
            <Typography.Text strong>Chat Quality</Typography.Text>
            <Typography.Text type="secondary">Agent Platform</Typography.Text>
          </div>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="app-sidebar__workspace">
          <Typography.Text className="app-sidebar__label">
            WORKSPACE HIỆN TẠI
          </Typography.Text>
          <Select
            value={currentWorkspace?.id}
            onChange={(value) => dispatch(setCurrentWorkspaceId(value))}
            options={workspaces.map((workspace) => ({
              label: workspace.name,
              value: workspace.id,
            }))}
            placeholder="Chọn workspace"
            className="w-full"
          />
        </div>
      ) : null}

      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[getSelectedKey(pathname)]}
        items={menuItems}
        className="app-sidebar__menu app-scrollbar"
      />

      <div className="app-sidebar__footer">
        <Tooltip
          title={collapsed ? currentWorkspace?.name : undefined}
          placement="right"
        >
          <div className="app-sidebar__tenant-mark">
            <span>
              {currentWorkspace?.name.slice(0, 2).toUpperCase() || 'NF'}
            </span>
            {!collapsed ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {currentWorkspace?.name || 'Chưa chọn workspace'}
                </div>
                <div className="text-xs text-slate-400">
                  {currentWorkspace?.myRole ||
                    currentWorkspace?.plan ||
                    'Workspace'}
                </div>
              </div>
            ) : null}
          </div>
        </Tooltip>
      </div>
    </aside>
  )
}
