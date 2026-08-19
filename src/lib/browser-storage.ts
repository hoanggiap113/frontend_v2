import {
  LEGACY_AGENT_KEYS,
  LEGACY_TENANT_KEYS,
  STORAGE_KEYS,
} from '#/constant'

function getLocalStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function cleanupLegacyLocalStorage() {
  const storage = getLocalStorage()
  if (!storage) return

  const currentTenant = storage.getItem(STORAGE_KEYS.currentTenant)
  if (!currentTenant) {
    const legacyTenant = LEGACY_TENANT_KEYS
      .map((key) => storage.getItem(key))
      .find((value): value is string => Boolean(value))
    if (legacyTenant) {
      storage.setItem(STORAGE_KEYS.currentTenant, legacyTenant)
    }
  }

  ;[...LEGACY_TENANT_KEYS, ...LEGACY_AGENT_KEYS].forEach((key) => {
    storage.removeItem(key)
  })
}

export function readAccessToken() {
  cleanupLegacyLocalStorage()
  return getLocalStorage()?.getItem(STORAGE_KEYS.accessToken) ?? ''
}

export function readRefreshToken() {
  return getLocalStorage()?.getItem(STORAGE_KEYS.refreshToken) ?? ''
}

export function readCurrentTenantId() {
  cleanupLegacyLocalStorage()
  return getLocalStorage()?.getItem(STORAGE_KEYS.currentTenant) ?? ''
}

export function persistCurrentTenantId(tenantId: string) {
  const storage = getLocalStorage()
  if (!storage) return

  if (tenantId) storage.setItem(STORAGE_KEYS.currentTenant, tenantId)
  else storage.removeItem(STORAGE_KEYS.currentTenant)
  cleanupLegacyLocalStorage()
}

export function readStoredUser() {
  return getLocalStorage()?.getItem(STORAGE_KEYS.user) ?? ''
}

export function persistStoredUser(value: string) {
  getLocalStorage()?.setItem(STORAGE_KEYS.user, value)
}

export function removeStoredUser() {
  getLocalStorage()?.removeItem(STORAGE_KEYS.user)
}

export function persistAuthTokens(tokens: {
  accessToken: string
  refreshToken?: string
}) {
  const storage = getLocalStorage()
  if (!storage) return

  storage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken)
  if (tokens.refreshToken) {
    storage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken)
  }
  cleanupLegacyLocalStorage()
}

export function clearAuthStorage() {
  const storage = getLocalStorage()
  if (!storage) return

  storage.removeItem(STORAGE_KEYS.accessToken)
  storage.removeItem(STORAGE_KEYS.refreshToken)
  storage.removeItem(STORAGE_KEYS.user)
  storage.removeItem(STORAGE_KEYS.currentTenant)
  storage.removeItem(STORAGE_KEYS.knownUserNames)
  cleanupLegacyLocalStorage()
}

export function readKnownUserNames() {
  return getLocalStorage()?.getItem(STORAGE_KEYS.knownUserNames) ?? ''
}

export function persistKnownUserNames(value: string) {
  getLocalStorage()?.setItem(STORAGE_KEYS.knownUserNames, value)
}
