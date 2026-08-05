import { useMemo, useState } from 'react'
import { ExternalLink, Eye, EyeOff, KeyRound, ShieldCheck, X } from '#/shared/ui/icons'
import type {
  ChatbotApiKeyConfig,
  ChatbotLlmProvider,
} from './types'
import {
  chatbotLlmProviders,
  chatbotModelOptions,
  getLlmProviderLabel,
} from '../lib/llmModels'

const API_KEY_GUIDE_URL = 'https://www.youtube.com/watch?v=nCU3WmylYMA'

interface ChatbotApiKeyDialogProps {
  initialConfig: ChatbotApiKeyConfig | null
  onClose: () => void
  onSave: (config: ChatbotApiKeyConfig) => void
}

export function ChatbotApiKeyDialog({
  initialConfig,
  onClose,
  onSave,
}: ChatbotApiKeyDialogProps) {
  const [provider, setProvider] = useState<ChatbotLlmProvider>(
    initialConfig?.provider ?? 'gemini',
  )
  const [model, setModel] = useState(
    initialConfig?.model ?? chatbotModelOptions.gemini[0].value,
  )
  const [apiKey, setApiKey] = useState(
    initialConfig?.provider === 'claude'
      ? (initialConfig.anthropicAuthToken ?? initialConfig.apiKey)
      : (initialConfig?.apiKey ?? ''),
  )
  const [anthropicBaseUrl, setAnthropicBaseUrl] = useState(
    initialConfig?.provider === 'claude'
      ? (initialConfig.anthropicBaseUrl ?? '')
      : '',
  )
  const [showKey, setShowKey] = useState(false)

  const models = chatbotModelOptions[provider]
  const isClaude = provider === 'claude'
  const hasValidClaudeBaseUrl =
    !isClaude || /^https?:\/\/\S+$/i.test(anthropicBaseUrl.trim())
  const canSave =
    apiKey.trim().length >= 10 && Boolean(model) && hasValidClaudeBaseUrl

  const selectedModelLabel = useMemo(() => {
    return models.find((item) => item.value === model)?.label ?? model
  }, [model, models])

  const handleProviderChange = (nextProvider: ChatbotLlmProvider) => {
    setProvider(nextProvider)
    setModel(chatbotModelOptions[nextProvider][0].value)
  }

  const handleSave = () => {
    if (!canSave) return
    onSave({
      provider,
      model,
      apiKey: apiKey.trim(),
      ...(isClaude
        ? {
            anthropicBaseUrl: anthropicBaseUrl.trim(),
            anthropicAuthToken: apiKey.trim(),
          }
        : {}),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Thêm API key chatbot
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Key dùng theo provider/model bạn chọn.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Provider
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {chatbotLlmProviders.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleProviderChange(item)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    provider === item
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {getLlmProviderLabel(item)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Model
            </label>
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            >
              {models.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {isClaude ? 'Anthropic auth token' : 'API key'}
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
              <input
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                type={showKey ? 'text' : 'password'}
                placeholder={
                  provider === 'gemini'
                    ? 'Google AI Studio API key'
                    : 'Anthropic auth token'
                }
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowKey((value) => !value)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-600"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {isClaude ? (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Anthropic base URL
              </label>
              <input
                value={anthropicBaseUrl}
                onChange={(event) => setAnthropicBaseUrl(event.target.value)}
                type="url"
                placeholder="https://your-claude-proxy.example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          ) : null}

          <div className="space-y-3 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">
            <div className="flex items-start gap-2">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>
                Sẽ dùng <strong>{selectedModelLabel}</strong>. Key chỉ nên giữ ở
                phiên trình duyệt và gửi kèm request khi chat.
              </span>
            </div>
            <a
              href={API_KEY_GUIDE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              Xem video hướng dẫn lấy API key
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Lưu API key
          </button>
        </div>
      </div>
    </div>
  )
}
