import { AlertTriangle, ArrowRight, RefreshCw } from '#/components/ui/icons'

function getRetryPath() {
  const from = new URLSearchParams(window.location.search).get('from')
  const retryUrl = new URL(from ?? '/', window.location.origin)

  return retryUrl.origin === window.location.origin && retryUrl.pathname !== '/500'
    ? `${retryUrl.pathname}${retryUrl.search}${retryUrl.hash}`
    : '/'
}

export default function InternalServerPage() {
  return (
    <main className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-[#f5f7f4] px-5 py-6 text-slate-900 sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(#b6c8bc_0.7px,transparent_0.7px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[30rem] rounded-full bg-emerald-200/40 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-900/15">
          <span className="text-sm font-black tracking-tight">CQ</span>
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-slate-900">
            Chat Quality
          </p>
          <p className="text-xs text-slate-500">Agent Platform</p>
        </div>
      </header>

      <section
        aria-labelledby="server-error-title"
        className="mx-auto my-auto grid w-full max-w-5xl items-center gap-10 py-14 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:py-20"
      >
        <div className="relative mx-auto flex w-full max-w-sm items-center justify-center md:justify-end">
          <div
            aria-hidden="true"
            className="text-[clamp(9rem,25vw,17rem)] font-extrabold leading-none tracking-[-0.1em] text-emerald-950/[0.06]"
          >
            500
          </div>
        </div>

        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Dịch vụ đang gián đoạn
          </div>
          <h1
            id="server-error-title"
            className="text-3xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl"
          >
            Hệ thống đang gặp sự cố.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
            Máy chủ chưa thể xử lý yêu cầu này. Hãy tải lại trang sau ít phút,
            hoặc quay về trang chủ để tiếp tục.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.assign(getRetryPath())}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold !text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <RefreshCw size={17} aria-hidden="true" />
              Tải lại trang
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              Về trang chủ
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>

          <p className="mt-8 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-500">
            Nếu sự cố tiếp diễn, vui lòng thử lại sau hoặc liên hệ đội hỗ trợ.
          </p>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between border-t border-slate-200/80 pt-4 text-xs text-slate-400">
        <span>Chat Quality Agent</span>
      </footer>
    </main>
  )
}
