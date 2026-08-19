export const WORKSPACE_STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  trial: 'bg-amber-50 text-amber-700',
  paused: 'bg-slate-100 text-slate-600',
} as const

export function canCreateWorkspace(form: { name: string; slug: string }) {
  return form.name.trim().length >= 2 && form.slug.trim().length >= 2
}
