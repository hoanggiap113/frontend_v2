import { apiRequest } from '#/lib/config/api'
import type { ApiResponse, PageResponse } from '#/lib/types/api'
import type {
  GetTenantsQuery,
  TenantResponse,
} from '#/lib/types/workspace'

const TENANT_ENDPOINTS = {
  list: '/tenants',
} as const

export const tenantService = {
  async getTenants(query: GetTenantsQuery) {
    const response = await apiRequest<
      ApiResponse<PageResponse<TenantResponse>>,
      never,
      { Page: number; Limit: number }
    >({
      method: 'GET',
      url: TENANT_ENDPOINTS.list,
      query: {
        Page: query.page,
        Limit: query.limit,
      },
    })

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'API tenants không trả về dữ liệu hợp lệ.',
      )
    }

    return response.data
  },
}
