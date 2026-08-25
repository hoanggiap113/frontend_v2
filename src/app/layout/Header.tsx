import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, Button, Dropdown, Input, Space, Tooltip, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Bell, LogOut, Menu, RefreshCw, Search, User } from '#/components/ui/icons'
import { authService } from '#/lib/services/authService'
import type { TenantResponse } from '#/lib/types/workspace'

interface HeaderProps {
  currentTenant?: TenantResponse
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
  const [loggingOut, setLoggingOut] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    try {
      await authService.logout()
    } finally {
      queryClient.clear()
      setLoggingOut(false)
      navigate({ to: '/login' })
    }
  }

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
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={16} />,
      label: loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất',
      onClick: handleLogout,
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
            <Avatar className="app-header__avatar">U</Avatar>
            <span className="app-header__account-copy">
              <span>Tài khoản</span>
              <small>Người dùng</small>
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  )
}
