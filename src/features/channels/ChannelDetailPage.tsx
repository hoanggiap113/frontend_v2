import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Pencil,
  RefreshCw,
  Trash2,
} from '#/components/ui/icons'
import ConnectChannelModal from './components/ConnectChannelModal'
import {
  ChannelStatusBadge,
  ChannelTypeBadge,
  SyncStatusBadge,
} from './components/ChannelHelpers'
import LoadingState from '#/components/ui/LoadingState'
import { useToast } from '#/app/providers/ToastProvider'
import NotificationDialog from './components/NotificationDialog'
import { formatDateTime } from '#/lib/helpers/datetime-helper'
import { getChannelErrorMessage } from '../../lib/helpers/channel-error-helper'
import { channelsService } from '../../lib/services/channels.service'
import { queryKeys } from '#/lib/config/query-keys'
import { selectCurrentWorkspaceId } from '#/app/store/index'
import { useAppSelector } from '#/app/store/hooks'
import type { ConnectChannelForm, SyncStatus } from '../../lib/types/channel'

function InfoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-800">{children}</div>
    </div>
  )
}

function syncSummary(status: SyncStatus) {
  const map = {
    synced: {
      icon: CheckCircle2,
      title: 'Đồng bộ thành công',
      description: 'Kênh đã đồng bộ thành công ở lần chạy gần nhất.',
      className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    },
    pending: {
      icon: RefreshCw,
      title: 'Đang đồng bộ',
      description: 'Hệ thống đang lấy dữ liệu mới từ kênh này.',
      className: 'border-amber-100 bg-amber-50 text-amber-700',
    },
    failed: {
      icon: AlertCircle,
      title: 'Đồng bộ thất bại',
      description: 'Lần đồng bộ gần nhất gặp lỗi. Kiểm tra lỗi bên dưới.',
      className: 'border-red-100 bg-red-50 text-red-700',
    },
    never: {
      icon: RefreshCw,
      title: 'Chưa từng đồng bộ',
      description: 'Kênh đã được kết nối nhưng chưa có lần đồng bộ thành công.',
      className: 'border-slate-100 bg-slate-50 text-slate-600',
    },
  } satisfies Record<
    SyncStatus,
    {
      icon: typeof CheckCircle2
      title: string
      description: string
      className: string
    }
  >

  return map[status]
}

export default function ChannelDetailPage({
  channelId,
}: {
  channelId: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const workspaceId = useAppSelector(selectCurrentWorkspaceId)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const { data: channel, error: channelError } = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: queryKeys.channelDetail(workspaceId || 'default', channelId),
    queryFn: () => channelsService.get(workspaceId, channelId),
    refetchInterval: (query) =>
      query.state.data?.syncStatus === 'pending' ? 2000 : false,
  })

  const syncMutation = useMutation({
    mutationFn: () => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      return channelsService.sync(workspaceId, channelId)
    },
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
      toast({
        title: 'Đã bắt đầu đồng bộ',
        description: 'Hệ thống đang đồng bộ dữ liệu mới cho kênh.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Đồng bộ thất bại',
        description: getChannelErrorMessage(error, 'sync'),
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      return channelsService.remove(workspaceId, channelId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.channels(workspaceId || 'default'),
      })
      toast({
        title: 'Đã xóa kênh',
        description: channel
          ? `${channel.name} đã được xóa khỏi workspace.`
          : 'Kênh đã được xóa khỏi workspace.',
        variant: 'success',
      })
      navigate({ to: '/channels' })
    },
    onError: (error) => {
      toast({
        title: 'Không xóa được kênh',
        description: getChannelErrorMessage(error, 'delete'),
        variant: 'error',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: ConnectChannelForm) => {
      if (!workspaceId) throw new Error('Chưa chọn workspace')
      return channelsService.update(workspaceId, channelId, payload)
    },
    onSuccess: async () => {
      setShowEdit(false)
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
      toast({
        title: 'Đã cập nhật kênh',
        description: 'Thông tin kênh đã được lưu.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Không cập nhật được kênh',
        description: getChannelErrorMessage(error, 'update'),
        variant: 'error',
      })
    },
  })

  useEffect(() => {
    if (!channelError) return

    toast({
      title: 'Không tải được kênh',
      description: getChannelErrorMessage(channelError, 'detail'),
      variant: 'error',
    })
  }, [channelError, toast])

  if (!channel) {
    return <LoadingState variant="page" title="Đang tải kênh" />
  }

  const summary = syncSummary(channel.syncStatus)
  const SummaryIcon = summary.icon
  const isSyncing = syncMutation.isPending || channel.syncStatus === 'pending'

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => navigate({ to: '/channels' })}
          className="rounded-xl p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex-1 text-xl font-bold text-slate-800">
          {channel.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            <Pencil size={13} /> Sửa
          </button>
          <button
            onClick={() => syncMutation.mutate()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 disabled:pointer-events-none disabled:opacity-60"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
          >
            <Trash2 size={13} /> Xóa
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Thông tin kênh
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Loại kênh">
            <ChannelTypeBadge type={channel.type} />
          </InfoRow>
          <InfoRow label="Trạng thái">
            <ChannelStatusBadge status={channel.status} />
          </InfoRow>
          <InfoRow label="Page / External ID">
            <span className="font-mono text-xs text-slate-700">
              {channel.appId || 'Chưa có'}
            </span>
          </InfoRow>
          <InfoRow label="Ngày tạo">
            {formatDateTime(channel.createdAt)}
          </InfoRow>
          <InfoRow label="Cập nhật gần nhất">
            {formatDateTime(channel.updatedAt, 'Chưa có dữ liệu')}
          </InfoRow>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Thông tin đồng bộ gần nhất
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Backend hiện lưu trạng thái đồng bộ gần nhất của kênh này.
            </p>
          </div>
          <SyncStatusBadge status={channel.syncStatus} />
        </div>

        <div className={`rounded-2xl border p-4 ${summary.className}`}>
          <div className="flex items-start gap-3">
            <SummaryIcon
              size={20}
              className={channel.syncStatus === 'pending' ? 'animate-spin' : ''}
            />
            <div>
              <div className="font-semibold">{summary.title}</div>
              <div className="mt-1 text-sm opacity-80">
                {summary.description}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Lần đồng bộ thành công gần nhất">
            {formatDateTime(channel.lastSyncAt)}
          </InfoRow>
          <InfoRow label="Trạng thái đồng bộ">
            <SyncStatusBadge status={channel.syncStatus} />
          </InfoRow>
          <InfoRow label="Lỗi gần nhất">
            {channel.lastSyncError ? (
              <span className="text-red-600">{channel.lastSyncError}</span>
            ) : (
              <span className="text-slate-500">Không có</span>
            )}
          </InfoRow>
        </div>
      </div>

      {showEdit && (
        <ConnectChannelModal
          mode="edit"
          initialValues={{
            type: channel.type,
            name: channel.name,
            appId: channel.appId ?? '',
            appSecret: '',
            syncInterval: channel.syncInterval,
            saveMedia: channel.saveMedia,
          }}
          submitting={updateMutation.isPending}
          error={
            updateMutation.error
              ? getChannelErrorMessage(updateMutation.error, 'update')
              : undefined
          }
          onClose={() => {
            updateMutation.reset()
            setShowEdit(false)
          }}
          onSuccess={async (payload) => {
            await updateMutation.mutateAsync(payload)
          }}
        />
      )}

      <NotificationDialog
        isOpen={showDelete}
        type="danger"
        title="Xóa kênh?"
        message={
          <>
            Kênh <strong className="text-slate-700">{channel.name}</strong> và
            toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.
          </>
        }
        cancelText="Hủy"
        confirmText="Xóa kênh"
        confirmLoading={deleteMutation.isPending}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
