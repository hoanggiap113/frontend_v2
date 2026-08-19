import { createFileRoute } from '@tanstack/react-router'
import TenantsPage from '#/features/workspaces/TenantsPage'

export const Route = createFileRoute('/_layout/tenants')({
  component: TenantsPage,
})
