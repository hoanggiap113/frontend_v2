import { jobFormSteps } from './jobFormConfig'
import type { StoredJobDraft } from '../../../lib/types/job-form'

export function readJobDraft(storageKey: string): StoredJobDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.sessionStorage.getItem(storageKey)
    if (!value) return null

    const parsed = JSON.parse(value) as Partial<StoredJobDraft>
    if (!parsed.form) return null

    return {
      form: parsed.form,
      step: Math.min(Math.max(parsed.step ?? 0, 0), jobFormSteps.length - 1),
    }
  } catch {
    return null
  }
}

export function writeJobDraft(storageKey: string, draft: StoredJobDraft) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(draft))
  } catch {
    return
  }
}

export function clearJobDraft(storageKey: string) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.removeItem(storageKey)
  } catch {
    return
  }
}
