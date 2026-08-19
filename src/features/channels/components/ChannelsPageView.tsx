import { Alert, Button, List, Modal, Pagination, Typography } from 'antd'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  RefreshCw,
} from '#/components/ui/icons'
import { AppCard, EmptyState, LoadingState, SectionCard } from '#/components'
import { formatDateTime, formatNumber } from '#/lib/index'
import {
  ChannelStatusBadge,
  ChannelTypeBadge,
  SyncStatusBadge,
} from './ChannelHelpers'
import ConnectChannelModal from './ConnectChannelModal'
import type { Channel, FacebookPageOption } from '../../../lib/types/channel'
import type {
  ChannelsPageViewProps,
  FacebookPagePickerState,
} from '../../../lib/types/channels-page'

export function ChannelsPageView({
  channels,
  createError,
  createSubmitting,
  currentPage,
  endIndex,
  facebookOAuthSubmitting,
  facebookPagePicker,
  filteredCount,
  isLoading,
  onCloseConnect,
  onCloseFacebookPagePicker,
  onFacebookOAuth,
  onOpenChannel,
  onOpenConnect,
  onPageChange,
  onSelectFacebookPage,
  onSubmitConnect,
  pageSize,
  showConnectModal,
  startIndex,
  totalItems,
}: ChannelsPageViewProps) {
  return (
    <div className="page-container">
      <section className="page-header">
        <div className="page-header__content">
          <div className="page-header__eyebrow">Kết nối dữ liệu</div>
          <Typography.Title level={2} className="page-header__title">
            Kênh chat
          </Typography.Title>
          <Typography.Text className="page-header__description">
            {filteredCount} kênh đang hiển thị. Quản lý kết nối Facebook và Zalo
            OA tại một nơi.
          </Typography.Text>
        </div>
        <div className="page-header__actions">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={onOpenConnect}
          >
            Kết nối kênh mới
          </Button>
        </div>
      </section>

      <SectionCard
        title="Danh sách kênh"
        description="Theo dõi trạng thái đồng bộ và số lượng hội thoại của từng kênh."
      >
        {isLoading ? (
          <LoadingState title="Đang tải kênh chat" />
        ) : filteredCount === 0 ? (
          <EmptyState
            title="Chưa có kênh nào"
            description="Kết nối kênh đầu tiên để bắt đầu đồng bộ hội thoại."
            action={
              <Button
                type="primary"
                icon={<Plus size={15} />}
                onClick={onOpenConnect}
              >
                Kết nối kênh
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onClick={() => onOpenChannel(channel.id)}
              />
            ))}
          </div>
        )}

        {filteredCount > pageSize ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Typography.Text type="secondary" className="text-sm">
              Hiển thị {startIndex + 1}-{endIndex} / {totalItems} kênh
            </Typography.Text>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              showSizeChanger={false}
              onChange={onPageChange}
            />
          </div>
        ) : null}
      </SectionCard>

      {showConnectModal ? (
        <ConnectChannelModal
          submitting={createSubmitting}
          facebookOAuthSubmitting={facebookOAuthSubmitting}
          error={createError}
          onClose={onCloseConnect}
          onFacebookOAuth={onFacebookOAuth}
          onSuccess={onSubmitConnect}
        />
      ) : null}

      {facebookPagePicker ? (
        <FacebookPagePickerModal
          {...facebookPagePicker}
          onClose={onCloseFacebookPagePicker}
          onSelect={onSelectFacebookPage}
        />
      ) : null}
    </div>
  )
}

function ChannelCard({
  channel,
  onClick,
}: {
  channel: Channel
  onClick: () => void
}) {
  const statusIcon = {
    active: <CheckCircle2 size={13} className="text-emerald-500" />,
    inactive: <Clock size={13} className="text-slate-400" />,
    error: <AlertCircle size={13} className="text-red-500" />,
  }[channel.status]

  return (
    <AppCard
      hoverable
      onClick={onClick}
      className="h-full cursor-pointer"
      styles={{ body: { padding: 18 } }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`grid size-10 shrink-0 place-items-center rounded-lg ${channel.type === 'zalo_oa' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}
          >
            <MessageSquare size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-800">
              {channel.name}
            </div>
            <div className="mt-1">
              <ChannelTypeBadge type={channel.type} />
            </div>
          </div>
        </div>
        <ChannelStatusBadge status={channel.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="mb-1 text-xs text-slate-400">Tổng cuộc chat</div>
          <div className="text-lg font-bold text-slate-800">
            {formatNumber(channel.totalConversations)}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="mb-1 text-xs text-slate-400">Chu kỳ đồng bộ</div>
          <div className="text-sm font-semibold text-slate-700">
            {channel.syncInterval} phút
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <RefreshCw size={11} />
          {formatDateTime(channel.lastSyncAt)}
        </div>
        <div className="flex items-center gap-1.5">
          {statusIcon}
          <SyncStatusBadge status={channel.syncStatus} />
        </div>
      </div>
    </AppCard>
  )
}

function FacebookPagePickerModal({
  connectingPageId,
  error,
  loading,
  pages,
  submitting,
  onClose,
  onSelect,
}: FacebookPagePickerState & {
  onClose: () => void
  onSelect: (page: FacebookPageOption) => void
}) {
  return (
    <Modal
      open
      title="Chọn Facebook Page"
      onCancel={onClose}
      footer={null}
      width={560}
      closable={!submitting}
      maskClosable={!submitting}
    >
      <Typography.Paragraph type="secondary">
        Chọn page muốn đồng bộ hội thoại vào workspace.
      </Typography.Paragraph>

      {error ? (
        <Alert type="error" showIcon message={error} className="mb-4" />
      ) : null}
      {loading ? <LoadingState title="Đang tải danh sách page" /> : null}

      {!loading && !error && pages.length === 0 ? (
        <EmptyState
          compact
          title="Không có Facebook Page phù hợp"
          description="Tài khoản Facebook này chưa có page có thể kết nối."
        />
      ) : null}

      {!loading && pages.length > 0 ? (
        <List
          dataSource={pages}
          renderItem={(pageOption) => (
            <List.Item
              actions={[
                <Button
                  key="connect"
                  type="primary"
                  loading={submitting && connectingPageId === pageOption.pageId}
                  disabled={
                    submitting && connectingPageId !== pageOption.pageId
                  }
                  onClick={() => onSelect(pageOption)}
                >
                  Kết nối
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={pageOption.name}
                description={`Page ID: ${pageOption.pageId}`}
              />
            </List.Item>
          )}
        />
      ) : null}
    </Modal>
  )
}
