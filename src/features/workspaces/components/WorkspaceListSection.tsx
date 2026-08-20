import { Button, Popconfirm, Tag, Typography } from 'antd'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Trash2,
} from '#/components/ui/icons'
import LoadingState from '#/components/ui/LoadingState'
import { AppCard, EmptyState, SectionCard } from '#/components'
import { formatDate } from '#/lib/helpers/datetime-helper'
import type { Workspace } from '../../../lib/types/workspace'
import { planLabel, statusLabel } from './tenantDisplay'

interface WorkspaceListSectionProps {
  canDeleteWorkspace: (workspaceId: string) => boolean
  currentWorkspaceId: string
  deletePending: boolean
  isLoading: boolean
  onDeleteWorkspace: (workspaceId: string) => void
  onSelectWorkspace: (workspace: Workspace) => void
  workspaces: Workspace[]
}

const statusColor: Record<Workspace['status'], string> = {
  active: 'green',
  trial: 'blue',
  paused: 'gold',
}

export function WorkspaceListSection({
  canDeleteWorkspace,
  currentWorkspaceId,
  deletePending,
  isLoading,
  onDeleteWorkspace,
  onSelectWorkspace,
  workspaces,
}: WorkspaceListSectionProps) {
  return (
    <SectionCard
      title="Danh sách workspace"
      description="Chọn workspace để chuyển ngữ cảnh làm việc trong toàn bộ hệ thống."
      extra={<Tag bordered={false}>{workspaces.length} workspace</Tag>}
    >
      {isLoading ? (
        <LoadingState
          title="Đang tải workspace"
          description="Danh sách workspace sẽ xuất hiện sau khi tải xong."
        />
      ) : null}

      {!isLoading && workspaces.length === 0 ? (
        <EmptyState
          title="Chưa có workspace"
          description="Tạo workspace đầu tiên để bắt đầu thiết lập hệ thống."
        />
      ) : null}

      {!isLoading && workspaces.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              active={workspace.id === currentWorkspaceId}
              canDelete={canDeleteWorkspace(workspace.id)}
              deleting={deletePending}
              workspace={workspace}
              onDelete={() => onDeleteWorkspace(workspace.id)}
              onSelect={() => onSelectWorkspace(workspace)}
            />
          ))}
        </div>
      ) : null}
    </SectionCard>
  )
}

function WorkspaceCard({
  active,
  canDelete,
  deleting,
  workspace,
  onDelete,
  onSelect,
}: {
  active: boolean
  canDelete: boolean
  deleting: boolean
  workspace: Workspace
  onDelete: () => void
  onSelect: () => void
}) {
  return (
    <AppCard
      className={active ? 'border-emerald-300 ring-2 ring-emerald-50' : ''}
      styles={{ body: { padding: 18 } }}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (!active) onSelect()
          }}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <div
            className={`grid size-11 shrink-0 place-items-center rounded-lg ${
              active
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Building2 size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Typography.Text strong className="truncate text-base">
                {workspace.name}
              </Typography.Text>
              {active ? (
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              ) : null}
            </div>
            <Typography.Text type="secondary" className="mt-1 block text-sm">
              /{workspace.slug}
            </Typography.Text>
          </div>
        </button>

        <Tag color={statusColor[workspace.status]} bordered={false}>
          {statusLabel[workspace.status]}
        </Tag>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <div className="text-xs text-slate-400">Thành viên</div>
        <div className="mt-1 font-bold text-slate-800">
          {workspace.membersCount}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Typography.Text type="secondary" className="text-xs">
              Gói dịch vụ
            </Typography.Text>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              {planLabel[workspace.plan]}
              {workspace.myRole ? ` · ${workspace.myRole}` : ''}
            </div>
          </div>
          <Typography.Text type="secondary" className="text-xs">
            Tạo {formatDate(workspace.createdAt)}
          </Typography.Text>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          icon={!active ? <ArrowRight size={14} /> : undefined}
          disabled={active}
          onClick={onSelect}
        >
          {active ? 'Đang chọn' : 'Chọn workspace'}
        </Button>

        <Popconfirm
          title="Xóa workspace"
          description={`Xóa workspace “${workspace.name}”? Thao tác này không thể hoàn tác.`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          disabled={!canDelete || deleting}
          onConfirm={onDelete}
        >
          <Button
            type="text"
            danger
            icon={<Trash2 size={14} />}
            disabled={!canDelete || deleting}
          >
            Xóa
          </Button>
        </Popconfirm>
      </div>
    </AppCard>
  )
}
