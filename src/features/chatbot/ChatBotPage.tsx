import { useEffect, useMemo, useState } from 'react'
import { Bot } from '#/components/ui/icons'
import { ChatbotApiKeyDialog } from './components/ChatbotApiKeyDialog'
import { ChatbotHistory } from './components/ChatbotHistory'
import { ChatbotWindow } from './components/ChatbotWindow'
import {
  chatbotRuntimeActions,
  useChatbotRuntime,
} from './chatbotRuntimeStore'
import type { ChatbotErrorFeedback, ChatbotThread } from '../../lib/types/chatbot'

function getChatbotErrorFeedback(rawMessage?: string | null): ChatbotErrorFeedback {
  const message = rawMessage?.trim() || ''
  const normalized = message.toLowerCase()

  if (
    normalized.includes('503') ||
    normalized.includes('unavailable') ||
    normalized.includes('high demand') ||
    normalized.includes('quá tải') ||
    normalized.includes('qua tai')
  ) {
    return {
      title: 'Model AI đang quá tải',
      description:
        'Provider AI đang bận nên chưa thể tạo câu trả lời cho yêu cầu này.',
      suggestions: [
        'Đợi một lát rồi gửi lại câu hỏi.',
        'Thử chuyển sang model Flash/Lite ổn định hơn.',
        'Nếu đang dùng model preview/pro, thử lại ngoài giờ cao điểm.',
      ],
    }
  }

  if (
    normalized.includes('429') ||
    normalized.includes('quota') ||
    normalized.includes('rate limit') ||
    normalized.includes('resource_exhausted')
  ) {
    return {
      title: 'API key bị giới hạn quota',
      description:
        'Key hoặc model đang chạm giới hạn gọi trong thời điểm hiện tại.',
      suggestions: [
        'Kiểm tra quota hoặc billing của API key.',
        'Thử model nhẹ hơn.',
        'Đợi quota reset rồi gửi lại.',
      ],
    }
  }

  return {
    title: 'Chatbot chưa xử lý được yêu cầu',
    description:
      message || 'Có lỗi xảy ra trong lúc agent tạo câu trả lời.',
    suggestions: [
      'Thử gửi lại câu hỏi sau vài giây.',
      'Nếu lỗi lặp lại, kiểm tra API key và trạng thái dịch vụ chatbot.',
    ],
  }
}

function decorateThreadForTranscript(thread?: ChatbotThread) {
  if (!thread) return thread

  const runtimeMessages = thread.messages.filter(
    (message) =>
      !message.id.startsWith('__runtime_processing_') &&
      !message.id.startsWith('__runtime_failed_'),
  )
  const lastMessage = runtimeMessages.at(-1)

  if (thread.status === 'running' && lastMessage?.role !== 'assistant') {
    return {
      ...thread,
      messages: [
        ...runtimeMessages,
        {
          id: `__runtime_processing_${thread.id}`,
          role: 'assistant' as const,
          content: '',
          sentAt: thread.updatedAt,
          isStreaming: true,
        },
      ],
    }
  }

  if (thread.status === 'failed' && lastMessage?.role !== 'assistant') {
    return {
      ...thread,
      messages: [
        ...runtimeMessages,
        {
          id: `__runtime_failed_${thread.id}`,
          role: 'assistant' as const,
          content: '',
          sentAt: thread.updatedAt,
          errorFeedback: getChatbotErrorFeedback(thread.lastMessagePreview),
        },
      ],
    }
  }

  return {
    ...thread,
    messages: runtimeMessages,
  }
}

export default function ChatBotPage() {
  const {
    threads,
    selectedId,
    search,
    streamingThreadId,
    apiKeyConfig,
  } = useChatbotRuntime()
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)

  useEffect(() => {
    void chatbotRuntimeActions.loadHistory()
  }, [])

  const hasRunningThread = threads.some((thread) => thread.status === 'running')

  useEffect(() => {
    if (!hasRunningThread || streamingThreadId) return

    const interval = window.setInterval(() => {
      void chatbotRuntimeActions.loadHistory()
    }, 2500)

    return () => window.clearInterval(interval)
  }, [hasRunningThread, streamingThreadId])

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return threads

    return threads.filter((thread) => {
      return (
        thread.botName.toLowerCase().includes(query) ||
        thread.firstUserMessage.toLowerCase().includes(query)
      )
    })
  }, [search, threads])

  const selectedThread =
    threads.find((thread) => thread.id === selectedId) ?? threads[0]
  const selectedThreadForView = useMemo(
    () => decorateThreadForTranscript(selectedThread),
    [selectedThread],
  )

  const usageSummary = useMemo(() => {
    return (selectedThreadForView?.messages ?? []).reduce(
      (total, message) => {
        if (!message.usage) return total
        total.inputTokens += message.usage.inputTokens
        total.outputTokens += message.usage.outputTokens
        return total
      },
      { inputTokens: 0, outputTokens: 0 },
    )
  }, [selectedThreadForView])

  const handleSendMessage = async (content: string) => {
    if (!apiKeyConfig) {
      setShowApiKeyDialog(true)
      return
    }

    await chatbotRuntimeActions.sendMessage(content)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <ChatbotHistory
          threads={filteredThreads}
          selectedId={selectedThread?.id ?? ''}
          search={search}
          onSearchChange={chatbotRuntimeActions.setSearch}
          onNewChat={chatbotRuntimeActions.newChat}
          onSelect={(id) => {
            void chatbotRuntimeActions.selectThread(id)
          }}
        />

        {selectedThreadForView ? (
          <ChatbotWindow
            thread={selectedThreadForView}
            apiKeyConfig={apiKeyConfig}
            usageSummary={usageSummary}
            isStreaming={
              streamingThreadId === selectedThreadForView.id ||
              selectedThreadForView.status === 'running'
            }
            isRequestLocked={
              hasRunningThread && selectedThreadForView.status !== 'running'
            }
            onOpenApiKey={() => setShowApiKeyDialog(true)}
            onApprovalResponse={chatbotRuntimeActions.respondToApproval}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
            <div className="text-center">
              <Bot className="mx-auto mb-3 text-slate-300" size={32} />
              Chua co doan chat nao.
            </div>
          </div>
        )}
      </div>

      {showApiKeyDialog ? (
        <ChatbotApiKeyDialog
          initialConfig={apiKeyConfig}
          onClose={() => setShowApiKeyDialog(false)}
          onSave={(config) => {
            chatbotRuntimeActions.setApiKeyConfig(config)
            setShowApiKeyDialog(false)
          }}
        />
      ) : null}
    </div>
  )
}
