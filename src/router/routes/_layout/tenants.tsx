import { createFileRoute } from '@tanstack/react-router'
import TenantsPage from '#/features/workspaces/TenantsPage'
import { tenantQueryOptions } from '#/lib/hooks/useTenant'
import toPositiveInteger from '#/lib'

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
  const query = Route.useLoaderDeps()
  const navigate = Route.useNavigate()

  return (
    <TenantsPage
      query={query}
      onPaginationChange={(page, limit) =>
        navigate({
          search: (current) => ({ ...current, page, limit }),
        })
      }
    />
  )
}
