import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesService } from './messages.service'
import { queryKeys } from '#/shared/service/query-keys'
import type {
  ConversationListParams,
  MessageListParams,
} from '../types/message'

export function useConversationsQuery(
  workspaceId: string,
  params: ConversationListParams = {},
) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: [...queryKeys.conversations(workspaceId || 'default'), params],
    queryFn: () => messagesService.list(workspaceId, params),
  })
}

export function useConversationDetailQuery(
  workspaceId: string,
  conversationId: string,
) {
  return useQuery({
    enabled: Boolean(workspaceId && conversationId),
    queryKey: queryKeys.conversationDetail(
      workspaceId || 'default',
      conversationId,
    ),
    queryFn: () => messagesService.get(workspaceId, conversationId),
  })
}

export function useConversationMessagesQuery(
  workspaceId: string,
  conversationId: string,
  params: MessageListParams = {},
) {
  return useQuery({
    enabled: Boolean(workspaceId && conversationId),
    queryKey: [
      ...queryKeys.conversationMessages(workspaceId || 'default', conversationId),
      params,
    ],
    queryFn: () => messagesService.messages(workspaceId, conversationId, params),
  })
}

export function useDeleteConversationMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagesService.remove(workspaceId, conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.conversations(workspaceId || 'default'),
      })
    },
  })
}

export function useDeleteMessageMutation(
  workspaceId: string,
  conversationId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) =>
      messagesService.removeMessage(workspaceId, conversationId, messageId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversationDetail(
            workspaceId || 'default',
            conversationId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversationMessages(
            workspaceId || 'default',
            conversationId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations(workspaceId || 'default'),
        }),
      ])
    },
  })
}
