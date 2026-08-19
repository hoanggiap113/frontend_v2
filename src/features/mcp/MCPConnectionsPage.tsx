import { Copy, KeyRound, PlugZap, ShieldCheck } from '#/components/ui/icons'
import { mcpSummary, mockMCPConnections } from '../../lib/services/mocks/mcp.mock'
import { MCP_STATUS_STYLES } from '../../lib/helpers/mcp-helper'

export default function MCPConnectionsPage() {
  const previewSecret = 'cqa_sk_live_x9d8...b41f'

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kết nối MCP</h1>
          <p className="mt-1 text-sm text-slate-500">Màn quản lý OAuth clients và quyền truy cập cho Claude Desktop/Web.</p>
        </div>
        <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">Tạo client mới</button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {mcpSummary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-800">{item.value}</div>
            <div className="mt-1 text-xs text-slate-400">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <PlugZap size={16} className="text-violet-500" />
            <h2 className="font-semibold text-slate-800">OAuth clients</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {mockMCPConnections.map((item) => (
              <div key={item.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${MCP_STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">Client ID: <span className="font-medium text-slate-700">{item.clientId}</span></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.scopes.map((scope) => (
                        <span key={scope} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {scope}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      Redirect URI: <span className="font-medium text-slate-700">{item.redirectUris[0]}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-400">{item.lastUsedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <KeyRound size={16} className="text-amber-500" /> Secret preview
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Generated client secret</div>
              <div className="mt-2 font-mono text-sm text-slate-700">{previewSecret}</div>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Copy size={14} /> Copy secret
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-600 to-emerald-500 p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <ShieldCheck size={15} /> Scope gợi ý
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-white/85">
              <li>• read:conversations</li>
              <li>• read:results</li>
              <li>• write:notes</li>
              <li>• export:transcripts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
