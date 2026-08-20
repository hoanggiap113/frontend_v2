import {
  LEGACY_AGENT_KEYS,
  LEGACY_AUTH_TOKEN_KEYS,
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
    const legacyTenant = LEGACY_TENANT_KEYS.map((key) =>
      storage.getItem(key),
    ).find((value): value is string => Boolean(value))
    if (legacyTenant) {
      storage.setItem(STORAGE_KEYS.currentTenant, legacyTenant)
    }
  }

  LEGACY_TENANT_KEYS.forEach((key) => {
    storage.removeItem(key)
  })

  // Tokens are now managed exclusively by HttpOnly cookies. Remove values
  // left behind by older frontend versions without touching tenant data.
  const legacyAuthKeys = [...LEGACY_AGENT_KEYS, ...LEGACY_AUTH_TOKEN_KEYS]
  legacyAuthKeys.forEach((key) => {
    storage.removeItem(key)
  })
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

export function hasStoredSession() {
  const raw = readStoredUser()
  if (!raw) return false

  try {
    return Boolean(JSON.parse(raw))
  } catch {
    removeStoredUser()
    return false
  }
}

export function persistStoredUser(value: string) {
  getLocalStorage()?.setItem(STORAGE_KEYS.user, value)
}

export function removeStoredUser() {
  getLocalStorage()?.removeItem(STORAGE_KEYS.user)
}

export function clearStoredAuthUser() {
  removeStoredUser()
  cleanupLegacyLocalStorage()
}

export function readKnownUserNames() {
  return getLocalStorage()?.getItem(STORAGE_KEYS.knownUserNames) ?? ''
}

export function persistKnownUserNames(value: string) {
  getLocalStorage()?.setItem(STORAGE_KEYS.knownUserNames, value)
}
