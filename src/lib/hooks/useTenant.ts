import { queryOptions, useQuery } from '@tanstack/react-query'
import { tenantService } from '#/lib/services/tenantService'
import type { GetTenantsQuery } from '#/lib/types/workspace'

export function tenantQueryOptions(query: GetTenantsQuery) {
  return queryOptions({
    queryKey: ['tenants', query.page, query.limit],
    queryFn: () => tenantService.getTenants(query),
  })
}

export function useTenant(query: GetTenantsQuery) {
  return useQuery({
    ...tenantQueryOptions(query),
    enabled: query.page > 0 && query.limit > 0,
  })
}
