import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Input,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Typography,
} from 'antd'
import { Plus, Shield, Trash2, UsersRound } from '#/components/ui/icons'
import LoadingState from '#/components/ui/LoadingState'
import { EmptyState, MetricTile, SectionCard } from '#/components'
import { permissionFeatures } from '../../lib/services/mocks/users.mock'
import { queryKeys } from '#/lib/services/query-keys'
import { usersService } from '../../lib/services/users.service'
import { invitationsService } from '#/lib/services/invitations.service'
import { useAppSelector } from '#/app/store/hooks'
import {
  selectCurrentWorkspaceId,
  selectCurrentWorkspaceRole,
} from '#/app/store/index'
import {
  buildInvitationSuccessMessage,
  buildUserStats,
  canInviteMember,
  canRemoveMember,
  canUpdateMemberRole,
  EDITABLE_ROLES,
  getInviteRolesForTenantRole,
  userRoleToTenantRole,
} from '../../lib/helpers/user-helper'
import type { TenantRole } from '#/lib/types/workspace'

const roleColor: Record<string, string> = {
  owner: 'purple',
  admin: 'blue',
  manager: 'cyan',
  member: 'default',
  viewer: 'default',
}

const statusColor: Record<string, string> = {
  active: 'green',
  inactive: 'default',
  pending: 'gold',
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const currentWorkspaceRole = useAppSelector(selectCurrentWorkspaceRole)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState<{
    email: string
    role: TenantRole
  }>({ email: '', role: 'MEMBER' })
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [memberError, setMemberError] = useState('')
  const [memberMessage, setMemberMessage] = useState('')

  const { data: users = [], isLoading } = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.users(workspaceId || 'default'),
    queryFn: () => usersService.list(workspaceId),
  })

  const stats = useMemo(
    () => buildUserStats(users, workspaceId),
    [users, workspaceId],
  )
  const inviteRoles = useMemo(
    () => getInviteRolesForTenantRole(currentWorkspaceRole),
    [currentWorkspaceRole],
  )

  useEffect(() => {
    if (!inviteRoles.length || inviteRoles.includes(inviteForm.role)) return
    setInviteForm((current) => ({ ...current, role: inviteRoles[0] }))
  }, [inviteForm.role, inviteRoles])

  const refreshMemberData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.users(workspaceId || 'default'),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
    ])
  }

  const inviteMutation = useMutation({
    mutationFn: () => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      if (
        !canInviteMember(workspaceId, inviteForm.email, currentWorkspaceRole)
      ) {
        throw new Error('Không có quyền mời thành viên trong workspace này.')
      }
      return invitationsService.inviteMember(workspaceId, {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
      })
    },
    onSuccess: async (invitation) => {
      setInviteError('')
      setInviteSuccess(buildInvitationSuccessMessage(invitation))
      setInviteForm({ email: '', role: 'MEMBER' })
      await refreshMemberData()
    },
    onError: (error) => {
      setInviteSuccess('')
      setInviteError(
        error instanceof Error ? error.message : 'Không gửi được lời mời.',
      )
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TenantRole }) => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      if (currentWorkspaceRole !== 'OWNER') {
        throw new Error('Chỉ OWNER mới có quyền cập nhật vai trò.')
      }
      return usersService.updateRole(workspaceId, userId, role)
    },
    onSuccess: async () => {
      setMemberError('')
      setMemberMessage('Đã cập nhật vai trò thành viên.')
      await refreshMemberData()
    },
    onError: (error) => {
      setMemberMessage('')
      setMemberError(
        error instanceof Error ? error.message : 'Không cập nhật được vai trò.',
      )
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      const target = users.find((user) => user.id === userId)
      const targetRole = target ? userRoleToTenantRole(target.role) : 'OWNER'
      if (!canRemoveMember(currentWorkspaceRole, targetRole)) {
        throw new Error('Không có quyền xóa thành viên này.')
      }
      return usersService.remove(workspaceId, userId)
    },
    onSuccess: async () => {
      setMemberError('')
      setMemberMessage('Đã xóa thành viên khỏi workspace.')
      await refreshMemberData()
    },
    onError: (error) => {
      setMemberMessage('')
      setMemberError(
        error instanceof Error ? error.message : 'Không xóa được thành viên.',
      )
    },
  })

  const canInvite = canInviteMember(
    workspaceId,
    inviteForm.email,
    currentWorkspaceRole,
  )
  const canOpenInvite = Boolean(workspaceId) && inviteRoles.length > 0

  const openInviteModal = () => {
    setInviteOpen(true)
    setInviteError('')
    setInviteSuccess('')
  }

  return (
    <div className="page-container">
      <section className="page-header">
        <div className="page-header__content">
          <div className="page-header__eyebrow">Quản trị workspace</div>
          <Typography.Title level={2} className="page-header__title">
            Người dùng
          </Typography.Title>
          <Typography.Text className="page-header__description">
            Quản lý thành viên, vai trò và quyền hạn theo từng workspace.
          </Typography.Text>
        </div>
        <div className="page-header__actions">
          <Button
            type="primary"
            icon={<Plus size={14} />}
            disabled={!canOpenInvite}
            onClick={openInviteModal}
          >
            Mời thành viên
          </Button>
        </div>
      </section>

      {memberError ? (
        <Alert type="error" showIcon message={memberError} className="mb-4" />
      ) : null}
      {memberMessage ? (
        <Alert
          type="success"
          showIcon
          message={memberMessage}
          className="mb-4"
        />
      ) : null}

      <div className="metric-grid mb-5">
        {stats.map((item, index) => (
          <MetricTile
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.note}
            accent={['#0f8f4e', '#1677ff', '#7c3aed', '#d97706'][index]}
            icon={<UsersRound size={17} />}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <SectionCard
          title="Danh sách thành viên"
          description="Cập nhật vai trò hoặc xóa thành viên khỏi workspace."
          extra={<UsersRound size={17} className="text-emerald-600" />}
          bodyClassName="!p-0"
        >
          {isLoading ? (
            <LoadingState title="Đang tải thành viên" className="m-5" />
          ) : users.length === 0 ? (
            <EmptyState
              compact
              title="Chưa có thành viên"
              description="Mời thành viên đầu tiên để bắt đầu cộng tác."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[880px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Thành viên</th>
                    <th className="px-5 py-3">Vai trò</th>
                    <th className="px-5 py-3">Team</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Workload</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const targetRole = userRoleToTenantRole(user.role)
                    const canEditRole = canUpdateMemberRole(
                      currentWorkspaceRole,
                      targetRole,
                    )
                    const canRemoveUser = canRemoveMember(
                      currentWorkspaceRole,
                      targetRole,
                    )

                    return (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100 hover:bg-emerald-50/25"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">
                            {user.name}
                          </div>
                          <div className="mt-1 text-slate-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {canEditRole ? (
                            <Select
                              size="small"
                              value={targetRole}
                              disabled={updateRoleMutation.isPending}
                              options={EDITABLE_ROLES.map((role) => ({
                                label: role.toLowerCase(),
                                value: role,
                              }))}
                              onChange={(role) =>
                                updateRoleMutation.mutate({
                                  userId: user.id,
                                  role,
                                })
                              }
                              className="min-w-28"
                            />
                          ) : (
                            <Tag
                              color={roleColor[user.role.toLowerCase()]}
                              bordered={false}
                            >
                              {user.role}
                            </Tag>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {user.team}
                        </td>
                        <td className="px-5 py-4">
                          <Tag
                            color={statusColor[user.status.toLowerCase()]}
                            bordered={false}
                          >
                            {user.status}
                          </Tag>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-700">
                          {user.workload}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Popconfirm
                            title="Xóa thành viên"
                            description={`Xóa ${user.email} khỏi workspace?`}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            disabled={!canRemoveUser}
                            onConfirm={() =>
                              removeMemberMutation.mutate(user.id)
                            }
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<Trash2 size={13} />}
                              disabled={
                                !canRemoveUser || removeMemberMutation.isPending
                              }
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <div className="space-y-5">
          <SectionCard
            title="Module quyền hạn"
            extra={<Shield size={16} className="text-violet-600" />}
          >
            <div className="space-y-2">
              {permissionFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3"
                >
                  <Typography.Text strong className="text-sm">
                    {feature}
                  </Typography.Text>
                  <div className="flex gap-1.5">
                    <Tag bordered={false}>read</Tag>
                    <Tag color="green" bordered={false}>
                      write
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Quyền của thành viên đầu tiên">
            <div className="flex flex-wrap gap-2">
              {users[0]?.permissions.length ? (
                users[0].permissions.map((permission) => (
                  <Tag key={permission} color="green" bordered={false}>
                    {permission}
                  </Tag>
                ))
              ) : (
                <Typography.Text type="secondary">
                  Chưa có dữ liệu quyền hạn.
                </Typography.Text>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <Modal
        open={inviteOpen}
        title="Mời thành viên"
        okText="Gửi lời mời"
        cancelText="Đóng"
        confirmLoading={inviteMutation.isPending}
        okButtonProps={{ disabled: !canInvite }}
        onOk={() => inviteMutation.mutate()}
        onCancel={() => {
          if (!inviteMutation.isPending) setInviteOpen(false)
        }}
      >
        <Typography.Paragraph type="secondary">
          Hệ thống sẽ gửi email chứa liên kết tham gia workspace.
        </Typography.Paragraph>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email
            </span>
            <Input
              type="email"
              value={inviteForm.email}
              placeholder="name@company.com"
              onChange={(event) =>
                setInviteForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Vai trò
            </span>
            <Select
              value={inviteForm.role}
              options={inviteRoles.map((role) => ({
                label: role,
                value: role,
              }))}
              onChange={(role) =>
                setInviteForm((current) => ({ ...current, role }))
              }
              className="w-full"
            />
          </label>

          {inviteError ? (
            <Alert type="error" showIcon message={inviteError} />
          ) : null}
          {inviteSuccess ? (
            <Alert type="success" showIcon message={inviteSuccess} />
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
