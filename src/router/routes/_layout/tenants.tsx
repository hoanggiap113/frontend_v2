import { createFileRoute } from '@tanstack/react-router'
import { TenantsPage } from '#/features/workspaces/pages'

export const Route = createFileRoute('/_layout/tenants')({
  component: TenantsPage,
})
