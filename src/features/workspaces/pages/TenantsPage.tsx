import { useEffect, useMemo, useState } from 'react'
import { Button, Tag, Typography } from 'antd'
import { Building2, MessageSquare, Plus, Users, Workflow } from '#/shared/ui/icons'
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal'
import { WorkspaceListSection } from '../components/WorkspaceListSection'
import {
  WorkspaceSummaryGrid,
  type WorkspaceSummaryItem,
} from '../components/WorkspaceSummaryGrid'
import { PageContainer, PageHeader, SectionCard } from '#/shared/ui/index'
import { useToast } from '#/shared/components/Toast'
import { useWorkspaceActions } from '../hooks/useWorkspaceActions'
import { getApiErrorMessage } from '#/shared/lib/api-error-helper'
import { canCreateWorkspace } from '../lib/tenant-helper'
import { useWorkspacesQuery } from '../service/workspaces.queries'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'
import { planLabel } from '../components/tenantDisplay'

export default function TenantsPage() {
  const { toast } = useToast()
  const currentWorkspaceId = useAppSelector(selectCurrentWorkspaceId)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const {
    createMutation,
    deleteMutation,
    createWorkspace,
    deleteWorkspace,
    selectWorkspace,
  } = useWorkspaceActions({
    onWorkspaceCreated: () => {
      setForm({ name: '', slug: '' })
      setShowCreateModal(false)
    },
  })

  const {
    data: workspaces = [],
    error: loadError,
    isLoading,
  } = useWorkspacesQuery()

  const canCreate = useMemo(() => canCreateWorkspace(form), [form])
  const canDeleteWorkspace = (workspaceId: string) =>
    workspaces.find((item) => item.id === workspaceId)?.myRole === 'OWNER'
  const currentWorkspace = workspaces.find((item) => item.id === currentWorkspaceId)

  const summaryCards = useMemo<WorkspaceSummaryItem[]>(() => {
    const active = workspaces.filter((item) => item.status === 'active').length
    const channels = workspaces.reduce((sum, item) => sum + item.channelsCount, 0)
    const jobs = workspaces.reduce((sum, item) => sum + item.jobsCount, 0)
    const members = workspaces.reduce((sum, item) => sum + item.membersCount, 0)

    return [
      {
        icon: Building2,
        label: 'Workspace',
        note: `${active} đang hoạt động`,
        value: workspaces.length,
      },
      {
        icon: MessageSquare,
        label: 'Kênh chat',
        note: 'Tổng kênh đã kết nối',
        value: channels,
      },
      {
        icon: Workflow,
        label: 'Tác vụ AI',
        note: 'Đang được cấu hình',
        value: jobs,
      },
      {
        icon: Users,
        label: 'Thành viên',
        note: 'Trên toàn bộ workspace',
        value: members,
      },
    ]
  }, [workspaces])

  useEffect(() => {
    if (!loadError) return

    toast({
      title: 'Không tải được workspace',
      description: getApiErrorMessage(
        loadError,
        'Không tải được danh sách workspace.',
      ),
      variant: 'error',
    })
  }, [loadError, toast])

  const handleCreateWorkspace = () => {
    if (!canCreate || createMutation.isPending) return
    createWorkspace(form)
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Tenant administration"
        title="Workspaces"
        description="Tổ chức tenant, phân quyền và chọn workspace vận hành cho kênh chat, tin nhắn và tác vụ AI."
        actions={
          <Button
            type="primary"
            icon={<Plus size={15} />}
            onClick={() => setShowCreateModal(true)}
          >
            Tạo workspace
          </Button>
        }
      />

      {currentWorkspace ? (
        <SectionCard
          title="Workspace hiện tại"
          description={`/${currentWorkspace.slug}`}
          extra={<Tag color="green">{currentWorkspace.myRole ?? currentWorkspace.plan}</Tag>}
          className="mb-5"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <CurrentWorkspaceItem label="Tên" value={currentWorkspace.name} />
            <CurrentWorkspaceItem
              label="Gói dịch vụ"
              value={planLabel[currentWorkspace.plan]}
            />
            <CurrentWorkspaceItem
              label="Kênh / tác vụ"
              value={`${currentWorkspace.channelsCount} / ${currentWorkspace.jobsCount}`}
            />
            <CurrentWorkspaceItem
              label="Thành viên"
              value={String(currentWorkspace.membersCount)}
            />
          </div>
        </SectionCard>
      ) : null}

      <div className="mb-5">
        <WorkspaceSummaryGrid items={summaryCards} />
      </div>

      <WorkspaceListSection
        canDeleteWorkspace={canDeleteWorkspace}
        currentWorkspaceId={currentWorkspaceId}
        deletePending={deleteMutation.isPending}
        isLoading={isLoading}
        workspaces={workspaces}
        onDeleteWorkspace={deleteWorkspace}
        onSelectWorkspace={selectWorkspace}
      />

      {showCreateModal ? (
        <CreateWorkspaceModal
          form={form}
          submitting={createMutation.isPending}
          canSubmit={canCreate}
          onChange={setForm}
          onClose={() => {
            if (createMutation.isPending) return
            setShowCreateModal(false)
          }}
          onSubmit={handleCreateWorkspace}
        />
      ) : null}
    </PageContainer>
  )
}

function CurrentWorkspaceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <Typography.Text type="secondary" className="text-xs">
        {label}
      </Typography.Text>
      <div className="mt-1 truncate text-sm font-bold text-slate-800">{value}</div>
    </div>
  )
}
