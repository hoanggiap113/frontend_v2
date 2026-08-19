import { Bot, Download, FileText } from '#/components/ui/icons'
import type { ConversationAttachment, ConversationMessage } from '../../../../lib/types/message'

interface MessageBubbleProps {
  message: ConversationMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.sender === 'agent'
  const isSystem = message.sender === 'system'
  const attachments = message.attachments ?? []
  const imageAttachments = attachments.filter((item) => item.kind === 'image')
  const fileAttachments = attachments.filter((item) => item.kind === 'file')

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[78%] ${
          isSystem
            ? 'border border-violet-200 bg-violet-50 text-violet-800'
            : isAgent
              ? 'bg-emerald-500 text-white'
              : 'border border-slate-200 bg-white text-slate-700'
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold opacity-80">
          {isSystem && <Bot size={12} />}
          <span>{message.senderName}</span>
          <span>•</span>
          <span>{message.time}</span>
        </div>
        {message.content ? (
          <div className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.content}
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className={message.content ? 'mt-3 space-y-3' : 'space-y-3'}>
            {imageAttachments.length > 0 ? (
              <div className="grid max-w-[360px] grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {imageAttachments.map((attachment) => (
                  <ImageAttachment
                    key={attachment.id}
                    attachment={attachment}
                    isAgent={isAgent}
                  />
                ))}
              </div>
            ) : null}

            {fileAttachments.length > 0 ? (
              <div className="space-y-2">
                {fileAttachments.map((attachment) => (
                  <FileAttachment
                    key={attachment.id}
                    attachment={attachment}
                    isAgent={isAgent}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ImageAttachment({
  attachment,
  isAgent,
}: {
  attachment: ConversationAttachment
  isAgent: boolean
}) {
  const src = attachment.thumbnailUrl || attachment.url

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className={`group block overflow-hidden rounded-xl border ${
        isAgent ? 'border-emerald-300/60 bg-emerald-400' : 'border-slate-200 bg-slate-50'
      }`}
      title={attachment.name}
    >
      <img
        src={src}
        alt={attachment.name}
        className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.03]"
        loading="lazy"
      />
    </a>
  )
}

function FileAttachment({
  attachment,
  isAgent,
}: {
  attachment: ConversationAttachment
  isAgent: boolean
}) {
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        isAgent
          ? 'border-emerald-300/60 bg-emerald-400/70 text-white hover:bg-emerald-400'
          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
      }`}
      title={attachment.name}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-lg ${
          isAgent ? 'bg-white/15' : 'bg-white text-slate-500'
        }`}
      >
        <FileText size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {attachment.name}
        </span>
        {attachment.mimeType ? (
          <span className={`block truncate text-xs ${isAgent ? 'text-white/75' : 'text-slate-400'}`}>
            {attachment.mimeType}
          </span>
        ) : null}
      </span>
      <Download size={16} className="shrink-0 opacity-80" />
    </a>
  )
}
