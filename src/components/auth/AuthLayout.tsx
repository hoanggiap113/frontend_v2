import type { ReactNode } from 'react'
import { Bot } from '#/components/ui/icons'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4f8] px-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200">
            <Bot size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-600">
            AI Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">Chat Quality Agent</p>
        </header>

        {children}

        <footer className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} AI Admin · Chat Quality Agent
        </footer>
      </div>
    </main>
  )
}
