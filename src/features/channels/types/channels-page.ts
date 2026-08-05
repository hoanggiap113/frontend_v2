import type {
  Channel,
  ConnectChannelForm,
  FacebookPageOption,
} from './channel'

export interface FacebookPagePickerState {
  connectingPageId: string | null
  error?: string
  loading: boolean
  pages: FacebookPageOption[]
  submitting: boolean
}

export interface ChannelsPageViewProps {
  channels: Channel[]
  currentPage: number
  endIndex: number
  filteredCount: number
  isLoading: boolean
  pageSize: number
  showConnectModal: boolean
  startIndex: number
  totalItems: number
  createError?: string
  createSubmitting: boolean
  facebookOAuthSubmitting: boolean
  facebookPagePicker?: FacebookPagePickerState
  onCloseConnect: () => void
  onCloseFacebookPagePicker: () => void
  onFacebookOAuth: () => void
  onOpenChannel: (channelId: string) => void
  onOpenConnect: () => void
  onPageChange: (page: number) => void
  onSelectFacebookPage: (page: FacebookPageOption) => void
  onSubmitConnect: (payload: ConnectChannelForm) => Promise<void>
}
