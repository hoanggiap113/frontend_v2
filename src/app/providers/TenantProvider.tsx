import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from '#/constant'

interface TenantContextValue {
  currentTenantId: string | null
  selectTenant: (tenantId: string) => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

function getStoredTenantId() {
  return localStorage.getItem(STORAGE_KEYS.currentTenant)
}

export default function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenantId, setCurrentTenantId] = useState(getStoredTenantId)

  const selectTenant = useCallback((tenantId: string) => {
    setCurrentTenantId(tenantId)
    localStorage.setItem(STORAGE_KEYS.currentTenant, tenantId)
  }, [])

  const value = useMemo(
    () => ({ currentTenantId, selectTenant }),
    [currentTenantId, selectTenant],
  )

  return <TenantContext value={value}>{children}</TenantContext>
}

export function useCurrentTenant() {
  const context = use(TenantContext)

  if (!context) {
    throw new Error('useCurrentTenant must be use in TenantProvider.')
  }

  return context
}
