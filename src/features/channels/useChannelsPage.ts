import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CHANNEL_PAGE_SIZE } from '#/constant'
import { selectCurrentWorkspaceId, selectGlobalSearch } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'
import { useToast } from '#/app/providers/ToastProvider'
import { paginateItems } from '#/lib/index'
import { queryKeys } from '#/lib/config/query-keys'
import { getChannelErrorMessage } from '../../lib/helpers/channel-error-helper'
import { filterChannels } from '../../lib/helpers/channel-helper'
import { channelsService } from '../../lib/services/channels.service'
import type {
  ConnectChannelForm,
  FacebookPageOption,
} from '../../lib/types/channel'
import type { ChannelsPageViewProps } from '../../lib/types/channels-page'

export function useChannelsPage(): ChannelsPageViewProps {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const globalSearch = useAppSelector(selectGlobalSearch)
  const [showModal, setShowModal] = useState(false)
  const [facebookOAuthSession, setFacebookOAuthSession] = useState<
    string | null
  >(null)
  const [facebookOAuthWorkspaceId, setFacebookOAuthWorkspaceId] = useState<
    string | null
  >(null)
  const [page, setPage] = useState(1)

  const {
    data: channels = [],
    error: loadError,
    isLoading,
  } = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.channels(workspaceId || 'default'),
    queryFn: () => channelsService.list(workspaceId),
    refetchInterval: (query) =>
      query.state.data?.some((channel) => channel.syncStatus === 'pending')
        ? 2000
        : false,
  })

  const createMutation = useMutation({
    mutationFn: (payload: ConnectChannelForm) => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      return channelsService.create(workspaceId, payload)
    },
    onSuccess: async (channel) => {
      setShowModal(false)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.channels(workspaceId || 'default'),
      })
      toast({
        title: 'Đã kết nối kênh',
        description: `${channel.name} đã sẵn sàng đồng bộ tin nhắn.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Không kết nối được kênh',
        description: getChannelErrorMessage(error, 'create'),
        variant: 'error',
      })
    },
  })

  const facebookAuthorizeMutation = useMutation({
    mutationFn: () => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      return channelsService.createFacebookOAuthUrl(workspaceId)
    },
    onSuccess: (authorizeUrl) => {
      window.location.assign(authorizeUrl)
    },
    onError: (error) => {
      toast({
        title: 'Không mở được Facebook OAuth',
        description: getChannelErrorMessage(error, 'create'),
        variant: 'error',
      })
    },
  })

  const facebookPagesQuery = useQuery({
    enabled: Boolean(facebookOAuthWorkspaceId && facebookOAuthSession),
    queryKey: [
      'facebook-oauth-pages',
      facebookOAuthWorkspaceId || 'default',
      facebookOAuthSession || 'default',
    ],
    queryFn: () =>
      channelsService.facebookPages(
        facebookOAuthWorkspaceId as string,
        facebookOAuthSession as string,
      ),
  })

  const connectFacebookPageMutation = useMutation({
    mutationFn: (pageOption: FacebookPageOption) => {
      if (!facebookOAuthWorkspaceId || !facebookOAuthSession) {
        throw new Error('Phiên kết nối Facebook không hợp lệ')
      }
      return channelsService.connectFacebookPage(facebookOAuthWorkspaceId, {
        sessionId: facebookOAuthSession,
        pageId: pageOption.pageId,
        name: pageOption.name,
      })
    },
    onSuccess: async (channel) => {
      const targetWorkspaceId =
        facebookOAuthWorkspaceId || workspaceId || 'default'
      setFacebookOAuthSession(null)
      setFacebookOAuthWorkspaceId(null)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.channels(targetWorkspaceId),
      })
      toast({
        title: 'Đã kết nối Facebook',
        description: `${channel.name} đã sẵn sàng đồng bộ tin nhắn.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Không kết nối được Facebook Page',
        description: getChannelErrorMessage(error, 'create'),
        variant: 'error',
      })
    },
  })

  const filteredChannels = useMemo(
    () => filterChannels(channels, globalSearch),
    [channels, globalSearch],
  )

  const pagination = useMemo(
    () =>
      paginateItems(filteredChannels, { page, pageSize: CHANNEL_PAGE_SIZE }),
    [filteredChannels, page],
  )

  useEffect(() => {
    setPage(1)
  }, [globalSearch])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthStatus = params.get('oauth')
    if (!oauthStatus) return

    if (oauthStatus === 'pages_ready') {
      const sessionId = params.get('sessionId')
      const tenantId = params.get('tenantId') || workspaceId
      if (!sessionId || !tenantId) return

      setFacebookOAuthSession(sessionId)
      setFacebookOAuthWorkspaceId(tenantId)
      toast({
        title: 'Đã đăng nhập Facebook',
        description: 'Chọn page bạn muốn kết nối vào workspace.',
        variant: 'success',
      })
    } else if (oauthStatus === 'success') {
      queryClient.invalidateQueries({
        queryKey: queryKeys.channels(workspaceId || 'default'),
      })
      toast({
        title: 'Đã kết nối Facebook',
        description: 'Token Facebook đã được cập nhật cho kênh.',
        variant: 'success',
      })
    } else if (oauthStatus === 'error') {
      toast({
        title: 'Facebook OAuth thất bại',
        description: 'Bạn vui lòng thử đăng nhập Facebook lại.',
        variant: 'error',
      })
    }

    window.history.replaceState({}, '', window.location.pathname)
  }, [queryClient, toast, workspaceId])

  useEffect(() => {
    if (!loadError) return

    toast({
      title: 'Không tải được kênh',
      description: getChannelErrorMessage(loadError, 'list'),
      variant: 'error',
    })
  }, [loadError, toast])

  return {
    channels: pagination.items,
    currentPage: pagination.page,
    endIndex: pagination.endIndex,
    filteredCount: filteredChannels.length,
    isLoading,
    pageSize: CHANNEL_PAGE_SIZE,
    showConnectModal: showModal,
    startIndex: pagination.startIndex,
    totalItems: pagination.totalItems,
    createError: createMutation.error
      ? getChannelErrorMessage(createMutation.error, 'create')
      : undefined,
    createSubmitting: createMutation.isPending,
    facebookOAuthSubmitting: facebookAuthorizeMutation.isPending,
    facebookPagePicker: facebookOAuthSession
      ? {
          loading: facebookPagesQuery.isLoading,
          error: facebookPagesQuery.error
            ? getChannelErrorMessage(facebookPagesQuery.error, 'create')
            : undefined,
          pages: facebookPagesQuery.data ?? [],
          connectingPageId:
            connectFacebookPageMutation.variables?.pageId ?? null,
          submitting: connectFacebookPageMutation.isPending,
        }
      : undefined,
    onCloseConnect: () => {
      createMutation.reset()
      setShowModal(false)
    },
    onCloseFacebookPagePicker: () => {
      setFacebookOAuthSession(null)
      setFacebookOAuthWorkspaceId(null)
      connectFacebookPageMutation.reset()
    },
    onFacebookOAuth: () => facebookAuthorizeMutation.mutate(),
    onOpenChannel: (channelId) =>
      navigate({ to: '/channels/$channelId', params: { channelId } }),
    onOpenConnect: () => setShowModal(true),
    onPageChange: setPage,
    onSelectFacebookPage: (pageOption) =>
      connectFacebookPageMutation.mutate(pageOption),
    onSubmitConnect: async (payload) => {
      await createMutation.mutateAsync(payload)
    },
  }
}
