import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, Button, Dropdown, Input, Space, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Bell, Building2, LogOut, Menu, RefreshCw, Search, User } from '#/components/ui/icons'
import { useLogout } from '../hooks/useLogout'
import { useCurrentTenant } from '../providers/TenantProvider'
import { isMockMode } from '#/lib/config/env'

interface HeaderProps {
  currentTenant: { name: string } | null
  onToggleSidebar: () => void
  pageTitle: string
}

export default function Header({
  currentTenant,
  onToggleSidebar,
  pageTitle,
}: HeaderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectTenant } = useCurrentTenant()
  const { loggingOut, logout } = useLogout()
  const mockMode = isMockMode()
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  const handleRefresh = async () => {
    if (refreshing) return

    setRefreshing(true)
    try {
      await queryClient.invalidateQueries()
    } finally {
      setRefreshing(false)
    }
  }

  const accountItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Tài khoản',
      disabled: true,
    },
    {
      key: 'workspaces',
      icon: <Building2 size={16} />,
      label: 'Đổi workspace',
      onClick: () => {
        selectTenant(null)
        void navigate({ to: '/tenants', replace: true })
      },
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={16} />,
      label: loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất',
      disabled: loggingOut,
      onClick: logout,
    },
  ]

  return (
    <header className="app-header">
      <div className="app-header__left">
        <Button
          type="text"
          icon={<Menu size={18} />}
          onClick={onToggleSidebar}
          aria-label="Thu gọn thanh điều hướng"
          className="app-header__menu-button"
        />
        <div className="min-w-0">
          <Typography.Title level={3} className="app-header__title">
            {pageTitle}
          </Typography.Title>
          <Typography.Text className="app-header__workspace-name">
            {currentTenant?.name || 'Chưa chọn workspace'}
          </Typography.Text>
        </div>
      </div>

      <div className="app-header__actions">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm kiếm trong trang..."
          prefix={<Search size={16} className="text-slate-400" />}
          allowClear
          className="app-header__search"
        />
        <Space size={6}>
          <Tooltip title="Làm mới dữ liệu">
            <Button
              type="text"
              loading={refreshing}
              icon={!refreshing ? <RefreshCw size={17} /> : undefined}
              onClick={handleRefresh}
              aria-label="Làm mới dữ liệu"
            />
          </Tooltip>
          <Tooltip title="Chưa có thông báo mới">
            <Button
              type="text"
              icon={<Bell size={17} />}
              aria-label="Thông báo"
            />
          </Tooltip>
        </Space>

        <Dropdown
          menu={{ items: accountItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <button type="button" className="app-header__account">
            <Avatar className="app-header__avatar">{mockMode ? 'A' : 'U'}</Avatar>
            <span className="app-header__account-copy">
              <span>{mockMode ? 'Admin Demo' : 'Tài khoản'}</span>
              <small>{mockMode ? 'Quản trị viên' : 'Người dùng'}</small>
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  )
}
