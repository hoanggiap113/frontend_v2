import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from '#/constant'
import type { TenantResponse } from '#/lib/types/workspace'

type SelectedTenant = Pick<TenantResponse, 'id' | 'name'>

interface TenantContextValue {
  currentTenant: SelectedTenant | null
  currentTenantId: string | null
  selectTenant: (tenant: SelectedTenant | null) => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function getStoredTenant(): SelectedTenant | null {
  try {
    const storedTenant: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEYS.currentTenant) ?? 'null',
    )
    if (!storedTenant || typeof storedTenant !== 'object') return null

    const tenant = storedTenant as Record<string, unknown>
    if (typeof tenant.id === 'string' && tenant.id && typeof tenant.name === 'string') {
      return { id: tenant.id, name: tenant.name }
    }
  } catch {
    return null
  }
  return null
}

export function clearStoredTenant() {
  sessionStorage.removeItem(STORAGE_KEYS.currentTenant)
}

export default function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState(getStoredTenant)

  const selectTenant = useCallback((tenant: SelectedTenant | null) => {
    const selection = tenant && { id: tenant.id, name: tenant.name }
    if (selection) {
      sessionStorage.setItem(STORAGE_KEYS.currentTenant, JSON.stringify(selection))
    } else {
      clearStoredTenant()
    }
    setCurrentTenant(selection)
  }, [])

  const value = useMemo(
    () => ({ currentTenant, currentTenantId: currentTenant?.id ?? null, selectTenant }),
    [currentTenant, selectTenant],
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
