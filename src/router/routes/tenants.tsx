import { createFileRoute } from '@tanstack/react-router'
import { useCurrentTenant } from '#/app/providers/TenantProvider'
import { WorkspacePage } from '#/features/workspaces'
import { toPositiveInteger } from '#/lib/convert'
import { requireSession } from '../requireSession'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

interface TenantSearch {
  page?: number
  limit?: number
}

export const Route = createFileRoute('/tenants')({
  validateSearch: (search: Record<string, unknown>): TenantSearch => ({
    page: toPositiveInteger(search.page, DEFAULT_PAGE),
    limit: toPositiveInteger(search.limit, DEFAULT_LIMIT),
  }),
  beforeLoad: ({ context }) => requireSession(context.queryClient),
  component: TenantsRoute,
})

function TenantsRoute() {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { selectTenant } = useCurrentTenant()

  return (
    <WorkspacePage
      query={{ page, limit }}
      onPageChange={(nextPage, nextLimit) =>
        navigate({ search: { page: nextPage, limit: nextLimit } })
      }
      onSelectWorkspace={(tenant) => {
        selectTenant(tenant)
        void navigate({ to: '/', replace: true })
      }}
    />
  )
}
