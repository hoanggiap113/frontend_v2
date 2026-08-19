import type { ChatbotLlmProvider } from '../../lib/types/chatbot'

export interface LlmModelOption {
  value: string
  label: string
}

export const chatbotLlmProviders: ChatbotLlmProvider[] = ['gemini', 'claude']

export const chatbotModelOptions: Record<
  ChatbotLlmProvider,
  LlmModelOption[]
> = {
  gemini: [
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ],
  claude: [
    { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
    { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
    { value: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
    { value: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
  ],
}

export function getLlmProviderLabel(provider: ChatbotLlmProvider) {
  return provider === 'gemini' ? 'Gemini' : 'Claude'
}
