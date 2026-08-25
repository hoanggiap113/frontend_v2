import { Button, Tag, Typography } from 'antd'
import { ArrowRight, Building2, CheckCircle2 } from '#/components/ui/icons'
import LoadingState from '#/components/ui/LoadingState'
import { AppCard, EmptyState, SectionCard } from '#/components'
import type { TenantResponse } from '#/lib/types/workspace'

interface WorkspaceListSectionProps {
  currentWorkspaceId: string | null
  isLoading: boolean
  onSelectWorkspace: (workspace: TenantResponse) => void
  workspaces: TenantResponse[]
}

export function WorkspaceListSection({
  currentWorkspaceId,
  isLoading,
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
          description="Tài khoản hiện chưa thuộc workspace nào."
        />
      ) : null}

      {!isLoading && workspaces.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              active={workspace.id === currentWorkspaceId}
              workspace={workspace}
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
  workspace,
  onSelect,
}: {
  active: boolean
  workspace: TenantResponse
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

        <Tag color={active ? 'green' : 'default'} bordered={false}>
          {active ? 'Đang sử dụng' : 'Workspace'}
        </Tag>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Typography.Text type="secondary" className="text-xs">
          {workspace.settings ? 'Đã có cấu hình' : 'Chưa có cấu hình'}
        </Typography.Text>
        <Button
          icon={!active ? <ArrowRight size={14} /> : undefined}
          disabled={active}
          onClick={onSelect}
        >
          {active ? 'Đang chọn' : 'Chọn workspace'}
        </Button>
      </div>
    </AppCard>
  )
}
