import { useEffect, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Pagination, Tag, Typography } from 'antd'
import { Building2 } from '#/components/ui/icons'
import { SectionCard } from '#/components'
import { useCurrentTenant } from '#/app/providers/TenantProvider'
import { useTenant, tenantQueryOptions } from '#/lib/hooks/useTenant'
import type { GetTenantsQuery } from '#/lib/types/workspace'
import toPositiveInteger from '#/lib'
import { WorkspaceListSection } from '#/features/workspaces/components/WorkspaceListSection'
import { WorkspaceSummaryGrid } from '#/features/workspaces/components/WorkspaceSummaryGrid'
import type { WorkspaceSummaryItem } from '#/features/workspaces/components/WorkspaceSummaryGrid'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

interface TenantSearch {
  page?: number
  limit?: number
}

export const Route = createFileRoute('/_layout/tenants')({
  validateSearch: (search: Record<string, unknown>): TenantSearch => ({
    page: toPositiveInteger(search.page, DEFAULT_PAGE),
    limit: toPositiveInteger(search.limit, DEFAULT_LIMIT),
  }),
  loaderDeps: ({ search }) => ({
    page: search.page ?? DEFAULT_PAGE,
    limit: search.limit ?? DEFAULT_LIMIT,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(tenantQueryOptions(deps)),
  component: TenantsRoute,
})

function TenantsRoute() {
  const query: GetTenantsQuery = Route.useLoaderDeps()
  const navigate = Route.useNavigate()
  const { currentTenantId, selectTenant } = useCurrentTenant()
  const { data: tenantPage, error, isFetching } = useTenant(query)
  const tenants = tenantPage?.data ?? []
  const currentTenant = tenants.find((item) => item.id === currentTenantId)

  useEffect(() => {
    if (tenants.length > 0 && !currentTenantId) {
      selectTenant(tenants[0].id)
    }
  }, [currentTenantId, selectTenant, tenants])

  const summaryCards = useMemo<WorkspaceSummaryItem[]>(
    () => [
      {
        icon: Building2,
        label: 'Workspace',
        note: `${tenantPage?.total ?? tenants.length} workspace khả dụng`,
        value: tenantPage?.total ?? tenants.length,
      },
    ],
    [tenantPage?.total, tenants.length],
  )

  return (
    <div className="page-container">
      <section className="page-header">
        <div className="page-header__content">
          <div className="page-header__eyebrow">Tenant administration</div>
          <Typography.Title level={2} className="page-header__title">
            Workspaces
          </Typography.Title>
          <Typography.Text className="page-header__description">
            Lựa chọn workspace để thay đổi ngữ cảnh làm việc của hệ thống.
          </Typography.Text>
        </div>
      </section>

      {error ? (
        <Alert
          className="mb-5"
          type="error"
          showIcon
          message="Không tải được danh sách workspace"
          description="Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
        />
      ) : null}

      {currentTenant ? (
        <SectionCard
          title="Workspace hiện tại"
          description={`/${currentTenant.slug}`}
          extra={<Tag color="green">Đang sử dụng</Tag>}
          className="mb-5"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <CurrentWorkspaceItem label="Tên" value={currentTenant.name} />
            <CurrentWorkspaceItem label="Slug" value={currentTenant.slug} />
            <CurrentWorkspaceItem
              label="Cấu hình"
              value={currentTenant.settings || 'Chưa cấu hình'}
            />
          </div>
        </SectionCard>
      ) : null}

      <div className="mb-5">
        <WorkspaceSummaryGrid items={summaryCards} />
      </div>

      <WorkspaceListSection
        currentWorkspaceId={currentTenantId}
        isLoading={isFetching && tenants.length === 0}
        workspaces={tenants}
        onSelectWorkspace={(tenant) => selectTenant(tenant.id)}
      />

      {(tenantPage?.total ?? 0) > query.limit ? (
        <div className="mt-5 flex justify-end">
          <Pagination
            current={query.page}
            pageSize={query.limit}
            total={tenantPage?.total ?? 0}
            showSizeChanger
            onChange={(page, limit) =>
              navigate({ search: (current) => ({ ...current, page, limit }) })
            }
          />
        </div>
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
