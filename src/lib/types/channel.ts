export type ChannelType = 'zalo_oa' | 'facebook' | 'pancake'

export type ChannelStatus = 'active' | 'inactive' | 'error'

export type SyncStatus = 'synced' | 'pending' | 'never' | 'failed'

export type SyncInterval = '5' | '15' | '30' | '60'

export type ApiChannelType = 'ZALO_OA' | 'FACEBOOK' | 'PANCAKE'

export type ApiSyncStatus = 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | null

export interface CreateChannelRequest {
  name: string
  channelType: ApiChannelType
  credentials: Record<string, string>
}

export interface UpdateChannelRequest {
  name?: string
  credentials?: Record<string, string>
}

export interface ChannelResponse {
  id: string
  tenantId: string
  name: string
  channelType: ApiChannelType
  externalId: string
  active: boolean
  lastSyncAt: string | null
  lastSyncStatus: ApiSyncStatus
  lastSyncError: string | null
  createdAt: string
  updatedAt: string | null
}


export interface Channel {
  id: string
  name: string
  type: ChannelType
  status: ChannelStatus
  syncStatus: SyncStatus
  lastSyncAt: string | null
  syncInterval: SyncInterval
  saveMedia: boolean
  totalConversations: number
  createdAt: string
  updatedAt?: string | null
  lastSyncError?: string | null
  appId?: string
}

export interface FacebookOAuthAuthorizeResponse {
  authorizeUrl: string
}

export interface FacebookPageOption {
  pageId: string
  name: string
}

export interface ConnectFacebookPagePayload {
  sessionId: string
  pageId: string
  name?: string
}


export interface ConnectChannelForm {
  type: ChannelType
  name: string
  appId: string
  appSecret: string
  syncInterval: SyncInterval
  saveMedia: boolean
}
