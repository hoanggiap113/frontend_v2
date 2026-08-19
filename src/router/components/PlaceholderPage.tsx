import { Construction } from '#/components/ui/icons'

type PlaceholderPageProps = {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Construction size={28} className="text-slate-400" />
      </div>

      <div className="text-center">
        <div className="text-lg font-bold text-slate-500 mb-1">{title}</div>
        <div className="text-sm text-slate-400">
          Trang này đang được phát triển
        </div>
      </div>
    </div>
  )
}
