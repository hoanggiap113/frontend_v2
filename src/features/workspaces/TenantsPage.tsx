import { useEffect, useMemo, useState } from 'react'
import { Button, Tag, Typography } from 'antd'
import { Building2, Plus, Users } from '#/components/ui/icons'
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal'
import { WorkspaceListSection } from './components/WorkspaceListSection'
import {
  WorkspaceSummaryGrid
  
} from './components/WorkspaceSummaryGrid'
import type {WorkspaceSummaryItem} from './components/WorkspaceSummaryGrid';
import { SectionCard } from '#/components'
import { useToast } from '#/app/providers/ToastProvider'
import { useWorkspaceActions } from './useWorkspaceActions'
import { getApiErrorMessage } from '#/lib/helpers/api-error-helper'
import { canCreateWorkspace } from '../../lib/helpers/tenant-helper'
import { useWorkspacesQuery } from '../../lib/hooks/workspaces.queries'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'
import { planLabel } from './components/tenantDisplay'

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
  const currentWorkspace = workspaces.find(
    (item) => item.id === currentWorkspaceId,
  )

  const summaryCards = useMemo<WorkspaceSummaryItem[]>(() => {
    const active = workspaces.filter((item) => item.status === 'active').length
    const members = workspaces.reduce((sum, item) => sum + item.membersCount, 0)

    return [
      {
        icon: Building2,
        label: 'Workspace',
        note: `${active} đang hoạt động`,
        value: workspaces.length,
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
    <div className="page-container">
      <section className="page-header">
        <div className="page-header__content">
          <div className="page-header__eyebrow">Tenant administration</div>
          <Typography.Title level={2} className="page-header__title">
            Workspaces
          </Typography.Title>
          <Typography.Text className="page-header__description">
            Tạo, lựa chọn và quản lý các workspace của hệ thống.
          </Typography.Text>
        </div>
        <div className="page-header__actions">
          <Button
            type="primary"
            icon={<Plus size={15} />}
            onClick={() => setShowCreateModal(true)}
          >
            Tạo workspace
          </Button>
        </div>
      </section>

      {currentWorkspace ? (
        <SectionCard
          title="Workspace hiện tại"
          description={`/${currentWorkspace.slug}`}
          extra={
            <Tag color="green">
              {currentWorkspace.myRole ?? currentWorkspace.plan}
            </Tag>
          }
          className="mb-5"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <CurrentWorkspaceItem label="Tên" value={currentWorkspace.name} />
            <CurrentWorkspaceItem
              label="Gói dịch vụ"
              value={planLabel[currentWorkspace.plan]}
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
    </div>
  )
}

function CurrentWorkspaceItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <Typography.Text type="secondary" className="text-xs">
        {label}
      </Typography.Text>
      <div className="mt-1 truncate text-sm font-bold text-slate-800">
        {value}
      </div>
    </div>
  )
}
