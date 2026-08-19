import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Space,
  Tooltip,
  Typography,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  Bell,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  User,
} from '#/components/ui/icons'
import { useAppDispatch, useAppSelector } from '#/app/store/hooks'
import {
  selectAuthUser,
  selectCurrentWorkspace,
  selectGlobalSearch,
} from '#/app/store/index'
import { readRefreshToken } from '#/lib/browser-storage'
import { authService } from '#/lib/services/auth.service'
import { clearSession } from '#/features/auth'
import { setGlobalSearch } from '#/app/store/uiSlice'

interface HeaderProps {
  onToggleSidebar: () => void
  pageTitle: string
}

export default function Header({ onToggleSidebar, pageTitle }: HeaderProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loggingOut, setLoggingOut] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const search = useAppSelector(selectGlobalSearch)
  const currentWorkspace = useAppSelector(selectCurrentWorkspace)
  const user = useAppSelector(selectAuthUser)
  const displayName = user?.name || user?.email || 'Unknown user'
  const displayEmail = user?.email || 'No email'
  const avatarLabel = displayName.slice(0, 1).toUpperCase()

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    try {
      const refreshToken = readRefreshToken()
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } finally {
      dispatch(clearSession())
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
            {currentWorkspace
              ? `${currentWorkspace.name} · ${currentWorkspace.myRole ?? currentWorkspace.plan}`
              : 'Chưa chọn workspace'}
          </Typography.Text>
        </div>
      </div>

      <div className="app-header__actions">
        <Input
          value={search}
          onChange={(event) => dispatch(setGlobalSearch(event.target.value))}
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

        <Dropdown menu={{ items: accountItems }} placement="bottomRight" trigger={['click']}>
          <button type="button" className="app-header__account">
            <Avatar className="app-header__avatar">{avatarLabel}</Avatar>
            <span className="app-header__account-copy">
              <span>{displayName}</span>
              <small>{displayEmail}</small>
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  )
}
