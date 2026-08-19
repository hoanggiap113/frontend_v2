import type { ReactNode } from 'react'
import type { AppIcon } from '#/components/ui/icons'

type ErrorTone = 'amber' | 'emerald' | 'rose'

interface ErrorAction {
  icon: AppIcon
  label: string
  onClick: () => void
}

interface SystemErrorPageProps {
  code: string
  description: string
  eyebrow: string
  icon: AppIcon
  primaryAction: ErrorAction
  secondaryAction?: ErrorAction
  status: string
  title: string
  tone: ErrorTone
  detail?: ReactNode
}

const toneStyles: Record<
  ErrorTone,
  {
    accent: string
    badge: string
    button: string
    glow: string
    icon: string
    line: string
    text: string
  }
> = {
  amber: {
    accent: 'bg-amber-400',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    button:
      'bg-amber-400 text-slate-950 shadow-amber-200 hover:bg-amber-300 focus-visible:ring-amber-300',
    glow: 'bg-amber-300/25',
    icon: 'border-amber-200 bg-amber-50 text-amber-700',
    line: 'bg-amber-400',
    text: 'text-amber-600',
  },
  emerald: {
    accent: 'bg-emerald-500',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    button:
      'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-500 focus-visible:ring-emerald-300',
    glow: 'bg-emerald-300/25',
    icon: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    line: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  rose: {
    accent: 'bg-rose-500',
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
    button:
      'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-500 focus-visible:ring-rose-300',
    glow: 'bg-rose-300/25',
    icon: 'border-rose-200 bg-rose-50 text-rose-700',
    line: 'bg-rose-500',
    text: 'text-rose-700',
  },
}

export default function SystemErrorPage({
  code,
  description,
  detail,
  eyebrow,
  icon: Icon,
  primaryAction,
  secondaryAction,
  status,
  title,
  tone,
}: SystemErrorPageProps) {
  const styles = toneStyles[tone]
  const PrimaryIcon = primaryAction.icon
  const SecondaryIcon = secondaryAction?.icon

  return (
    <main
      className="relative isolate grid min-h-[100dvh] w-full place-items-center overflow-hidden bg-[#f3f6f4] px-5 py-10 text-slate-950 sm:px-8 lg:px-12"
      aria-labelledby={`error-title-${code}`}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.32]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div
        className={`pointer-events-none absolute -right-28 -top-36 -z-10 size-[30rem] rounded-full blur-3xl ${styles.glow}`}
      />
      <div className="pointer-events-none absolute bottom-7 left-7 hidden items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.28em] text-slate-400 md:flex">
        <span className={`h-px w-16 ${styles.line}`} />
        CQA system response
      </div>

      <section className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/85 shadow-[0_30px_100px_rgba(15,23,42,0.13)] backdrop-blur-xl">
        <div className={`h-1.5 w-full ${styles.accent}`} />

        <div className="grid lg:grid-cols-[minmax(0,0.82fr)_minmax(30rem,1.18fr)]">
          <div className="relative flex min-h-[22rem] items-center justify-center overflow-hidden border-b border-slate-200 bg-slate-950 px-8 py-12 lg:min-h-[38rem] lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="absolute left-7 top-7 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              <span
                className={`size-2 rounded-full ${styles.accent} motion-safe:animate-pulse`}
              />
              Exception code
            </div>

            <div className="relative text-center">
              <div
                aria-hidden="true"
                className={`absolute inset-0 translate-x-2 translate-y-2 font-[Fraunces] text-[clamp(7rem,22vw,14rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.12)] ${styles.text}`}
              >
                {code}
              </div>
              <p className="relative font-[Fraunces] text-[clamp(7rem,22vw,14rem)] font-bold leading-none tracking-[-0.08em] text-white">
                {code}
              </p>
              <div className="relative mx-auto mt-7 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                <Icon size={16} className={styles.text} aria-hidden="true" />
                {status}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between px-7 py-9 sm:px-12 sm:py-12 lg:px-16 lg:py-16">
            <div>
              <div
                className={`mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] ${styles.badge}`}
              >
                <span className={`size-1.5 rounded-full ${styles.accent}`} />
                {eyebrow}
              </div>

              <h1
                id={`error-title-${code}`}
                className="max-w-xl font-[Fraunces] text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-slate-950 sm:text-5xl"
              >
                {title}
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-600">
                {description}
              </p>

              {detail ? (
                <div className="mt-8 border-l-2 border-slate-200 pl-5 text-sm leading-6 text-slate-500">
                  {detail}
                </div>
              ) : null}
            </div>

            <div className="mt-10">
              <div className="mb-8 grid grid-cols-3 gap-3 border-y border-slate-200 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                <span>Node / web</span>
                <span>Scope / client</span>
                <span className="text-right">State / halted</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold shadow-lg transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 ${styles.button}`}
                >
                  <PrimaryIcon size={17} aria-hidden="true" />
                  {primaryAction.label}
                </button>

                {secondaryAction && SecondaryIcon ? (
                  <button
                    type="button"
                    onClick={secondaryAction.onClick}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                  >
                    <SecondaryIcon size={17} aria-hidden="true" />
                    {secondaryAction.label}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
