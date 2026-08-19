import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { channelsService } from '../services/channels.service'
import { queryKeys } from '#/lib/services/query-keys'
import type { ConnectChannelForm } from '../types/channel'

export function useChannelsQuery(workspaceId: string) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.channels(workspaceId || 'default'),
    queryFn: () => channelsService.list(workspaceId),
  })
}

export function useChannelDetailQuery(workspaceId: string, channelId: string) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.channelDetail(workspaceId || 'default', channelId),
    queryFn: () => channelsService.get(workspaceId, channelId),
  })
}

export function useCreateChannelMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ConnectChannelForm) =>
      channelsService.create(workspaceId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.channels(workspaceId || 'default'),
      })
    },
  })
}

export function useSyncChannelMutation(workspaceId: string, channelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => channelsService.sync(workspaceId, channelId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.channelDetail(
            workspaceId || 'default',
            channelId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.channels(workspaceId || 'default'),
        }),
      ])
    },
  })
}

export function useUpdateChannelMutation(
  workspaceId: string,
  channelId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ConnectChannelForm) =>
      channelsService.update(workspaceId, channelId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.channelDetail(
            workspaceId || 'default',
            channelId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.channels(workspaceId || 'default'),
        }),
      ])
    },
  })
}

export function useDeleteChannelMutation(
  workspaceId: string,
  channelId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => channelsService.remove(workspaceId, channelId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.channels(workspaceId || 'default'),
      })
    },
  })
}
