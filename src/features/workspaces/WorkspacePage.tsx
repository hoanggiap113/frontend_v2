import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Avatar, Badge, Button, Card, Dropdown, Flex, Input, Layout, message, Pagination, Tag, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useLogout } from '#/app/hooks/useLogout'
import { EmptyState } from '#/components'
import {
  Building2,
  Bell,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  User,
} from '#/components/ui/icons'
import { isMockMode } from '#/lib/config/env'
import LoadingState from '#/components/ui/LoadingState'
import { useTenant } from '#/lib/hooks/useTenant'
import type { GetTenantsQuery, TenantResponse } from '#/lib/types/workspace'
import { WorkspaceListSection } from './components/WorkspaceListSection'
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal'
import {
  acceptMockWorkspaceInvitation,
  createMockTenant,
  hasAcceptedMockWorkspaceInvitation,
} from '#/lib/services/mocks/mockTenants'

const RECENT_WORKSPACE_KEY = 'cqa_recent_workspace'

interface WorkspacePageProps {
  query: GetTenantsQuery
  onPageChange: (page: number, limit: number) => void
  onSelectWorkspace: (workspace: TenantResponse) => void
}

export function WorkspacePage({
  query,
  onPageChange,
  onSelectWorkspace,
}: WorkspacePageProps) {
  const { data: tenantPage, isPending, isError, isFetching, refetch } = useTenant(query)
  const { loggingOut, logout } = useLogout()
  const queryClient = useQueryClient()
  const accountName = isMockMode() ? 'Admin Demo' : 'Tài khoản'
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', slug: '' })
  const [recentWorkspaceId, setRecentWorkspaceId] = useState(
    () => localStorage.getItem(RECENT_WORKSPACE_KEY),
  )
  const [invitationAccepted, setInvitationAccepted] = useState(
    () => !isMockMode() || hasAcceptedMockWorkspaceInvitation(),
  )
  const [actionError, setActionError] = useState('')
  const [toast, messageContext] = message.useMessage()
  const accountItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Hồ sơ',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={16} />,
      label: 'Đăng xuất',
      disabled: loggingOut,
      onClick: logout,
    },
  ]
  const keyword = search.trim().toLocaleLowerCase('vi')
  const workspaces = tenantPage?.data ?? []
  const visibleWorkspaces = workspaces.filter((workspace) =>
    [workspace.name, workspace.slug].some((value) =>
      value.toLocaleLowerCase('vi').includes(keyword),
    ),
  )
  const createWorkspace = () => {
    if (!isMockMode()) {
      setCreateOpen(false)
      setActionError('API hiện chưa hỗ trợ tạo workspace từ màn hình này.')
      return
    }
    const name = createForm.name.trim()
    const slug = createForm.slug.trim().toLocaleLowerCase('vi')
    if (!name || !slug) return
    if (workspaces.some((workspace) => workspace.slug === slug)) {
      setActionError('Slug workspace đã tồn tại.')
      return
    }
    createMockTenant(name, slug)
    setCreateOpen(false)
    setCreateForm({ name: '', slug: '' })
    setActionError('')
    void queryClient.invalidateQueries({ queryKey: ['tenants'] })
    toast.success('Đã tạo workspace mới.')
  }
  const acceptInvitation = () => {
    acceptMockWorkspaceInvitation()
    setInvitationAccepted(true)
    void queryClient.invalidateQueries({ queryKey: ['tenants'] })
    toast.success('Đã chấp nhận lời mời tham gia Gom Support.')
  }

  return (
    <Layout className="workspace-picker">
      {messageContext}
      <header className="workspace-picker__nav">
        <Flex align="center" justify="space-between" className="workspace-picker__nav-inner">
          <Flex align="center" gap={10} className="workspace-picker__brand">
            <span className="workspace-picker__brand-icon">
              <MessageSquare size={19} aria-hidden="true" />
            </span>
            <Typography.Text strong>Gom-message</Typography.Text>
          </Flex>
          <Flex align="center" gap={10}>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: !isMockMode()
                  ? [{ key: 'unavailable', label: 'Lời mời sẽ được hiển thị ở đây.', disabled: true }]
                  : invitationAccepted
                    ? [{ key: 'empty', label: 'Bạn chưa có lời mời nào.', disabled: true }]
                    : [{ key: 'invitation', label: <div className="workspace-picker__invite-item"><Typography.Text strong>Gom Support</Typography.Text><Typography.Text type="secondary">Bạn được mời tham gia · Thành viên</Typography.Text><Button type="primary" size="small" onClick={acceptInvitation}>Chấp nhận lời mời</Button></div> }],
              }}
            >
              <Button
                className="workspace-picker__notification"
                aria-label={!isMockMode() ? 'Thông báo' : invitationAccepted ? 'Thông báo, không có lời mời mới' : 'Thông báo, có 1 lời mời mới'}
                icon={<Badge dot={!invitationAccepted}><Bell size={17} /></Badge>}
              />
            </Dropdown>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{ items: accountItems }}
            >
              <button
                type="button"
                className="workspace-picker__account-trigger"
                aria-label="Mở menu tài khoản"
              >
                <Flex align="center" gap={9} className="workspace-picker__account">
                  <Flex vertical align="flex-end" gap={1}>
                    <Typography.Text strong>{accountName}</Typography.Text>
                    <Typography.Text type="secondary" className="text-xs">
                      {isMockMode() ? 'Quản trị viên' : 'Tài khoản'}
                    </Typography.Text>
                  </Flex>
                  <Avatar
                    size={38}
                    icon={<User size={18} aria-hidden="true" />}
                    className="workspace-picker__avatar"
                  />
                </Flex>
              </button>
            </Dropdown>
          </Flex>
        </Flex>
      </header>
      <Layout.Content className="workspace-picker__content" aria-labelledby="workspace-picker-title">
        <Card variant="borderless" size="small" className="workspace-picker__toolbar">
          <div className="workspace-picker__heading-row">
            <Flex align="center" gap={8} className="workspace-picker__total">
              <Building2 size={16} aria-hidden="true" />
              {tenantPage ? <Tag color="blue" variant="filled">{tenantPage.total}</Tag> : null}
            </Flex>
            <Typography.Title id="workspace-picker-title" level={1} className="workspace-picker__title">
              Chọn workspace
            </Typography.Title>
            <div className="workspace-picker__tools">
              <Input
                allowClear
                size="middle"
                prefix={<Search size={16} aria-hidden="true" />}
                placeholder="Tìm workspace"
                aria-label="Tìm workspace trong trang"
                className="workspace-picker__search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Button
                className="workspace-picker__refresh"
                icon={<RefreshCw size={16} />}
                loading={isFetching}
                aria-label="Tải lại danh sách workspace"
                onClick={() => void refetch()}
              />
              <Button type="primary" icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
                Tạo workspace
              </Button>
            </div>
          </div>
        </Card>

        {actionError ? <Alert type="error" showIcon message={actionError} closable onClose={() => setActionError('')} /> : null}
        <section className="workspace-picker__panel" aria-label="Danh sách workspace">
          {isError ? <Alert type="error" showIcon message="Không tải được danh sách workspace. Vui lòng thử tải lại." /> : null}
          {isPending ? <LoadingState title="Đang tải workspace" /> : null}
          {!isPending && !isError && visibleWorkspaces.length === 0 ? (
            <EmptyState
              title={keyword ? 'Không tìm thấy workspace trong trang này' : 'Chưa có workspace'}
              description={keyword ? undefined : 'Tài khoản hiện chưa thuộc workspace nào.'}
            />
          ) : null}
          {!isPending && !isError && (visibleWorkspaces.length > 0 || !keyword) ? (
            <WorkspaceListSection
              workspaces={visibleWorkspaces}
              recentWorkspaceId={recentWorkspaceId}
              showCreateTile={tenantPage.total < 4}
              onCreateWorkspace={() => isMockMode() ? setCreateOpen(true) : setActionError('API hiện chưa hỗ trợ tạo workspace từ màn hình này.')}
              onSelectWorkspace={(workspace) => {
                localStorage.setItem(RECENT_WORKSPACE_KEY, workspace.id)
                setRecentWorkspaceId(workspace.id)
                onSelectWorkspace(workspace)
              }}
            />
          ) : null}
          {tenantPage && tenantPage.total > query.limit ? (
            <Flex justify="flex-end" className="mt-5">
              <Pagination current={query.page} pageSize={query.limit} total={tenantPage.total} showSizeChanger onChange={onPageChange} />
            </Flex>
          ) : null}
        </section>
      </Layout.Content>
      {createOpen ? (
        <CreateWorkspaceModal
          canSubmit={Boolean(createForm.name.trim() && createForm.slug.trim())}
          form={createForm}
          onChange={setCreateForm}
          onClose={() => setCreateOpen(false)}
          onSubmit={createWorkspace}
          submitting={false}
        />
      ) : null}
    </Layout>
  )
}
