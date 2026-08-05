import { endpoints } from '#/shared/service/endpoints'
import { clone, mockDelay } from '#/shared/service/utils'
import { mockChannels } from '../data/mock_data'
import { isMockMode } from '#/shared/config/env'
import { httpClient } from '#/shared/service/http/client'
import type {
  ApiChannelType,
  ApiSyncStatus,
  Channel,
  ChannelResponse,
  ChannelType,
  ConnectFacebookPagePayload,
  ConnectChannelForm,
  CreateChannelRequest,
  FacebookOAuthAuthorizeResponse,
  FacebookPageOption,
  SyncStatus,
  UpdateChannelRequest,
} from '../types/channel'

let channelState = clone(mockChannels)

function toApiChannelType(type: ChannelType): ApiChannelType {
  const typeMap: Record<ChannelType, ApiChannelType> = {
    zalo_oa: 'ZALO_OA',
    facebook: 'FACEBOOK',
    pancake: 'PANCAKE',
  }

  return typeMap[type]
}

function toUiChannelType(type: ApiChannelType): ChannelType {
  const typeMap: Record<ApiChannelType, ChannelType> = {
    ZALO_OA: 'zalo_oa',
    FACEBOOK: 'facebook',
    PANCAKE: 'pancake',
  }

  return typeMap[type]
}

function toUiSyncStatus(status: ApiSyncStatus): SyncStatus {
  const statusMap: Record<Exclude<ApiSyncStatus, null>, SyncStatus> = {
    SUCCESS: 'synced',
    FAILED: 'failed',
    IN_PROGRESS: 'pending',
  }

  return status ? statusMap[status] : 'never'
}

function toCreateChannelRequest(
  payload: ConnectChannelForm,
): CreateChannelRequest {
  return {
    name: payload.name,
    channelType: toApiChannelType(payload.type),
    credentials: {
      pageId: payload.appId,
      pageAccessToken: payload.appSecret,
    },
  }
}

function toUpdateChannelRequest(
  payload: ConnectChannelForm,
): UpdateChannelRequest {
  const request: UpdateChannelRequest = {
    name: payload.name,
  }

  if (payload.appId && payload.appSecret) {
    request.credentials = {
      pageId: payload.appId,
      pageAccessToken: payload.appSecret,
    }
  }

  return request
}

function toChannel(response: ChannelResponse): Channel {
  const syncStatus = toUiSyncStatus(response.lastSyncStatus)

  return {
    id: response.id,
    name: response.name,
    type: toUiChannelType(response.channelType),
    status: response.active
      ? response.lastSyncStatus === 'FAILED'
        ? 'error'
        : 'active'
      : 'inactive',
    syncStatus,
    lastSyncAt: response.lastSyncAt,
    syncInterval: '15',
    saveMedia: false,
    totalConversations: 0,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    lastSyncError: response.lastSyncError,
    appId: response.externalId,
  }
}

export const channelsService = {
  async list(workspaceId: string): Promise<Channel[]> {
    if (isMockMode()) {
      await mockDelay()
      return clone(channelState)
    }
    const response = await httpClient.get<ChannelResponse[]>(
      endpoints.channels.list(workspaceId),
    )
    return response.map(toChannel)
  },
  async get(workspaceId: string, channelId: string): Promise<Channel | null> {
    if (isMockMode()) {
      await mockDelay()
      return clone(channelState.find((item) => item.id === channelId) ?? null)
    }
    const response = await httpClient.get<ChannelResponse>(
      endpoints.channels.detail(workspaceId, channelId),
    )
    return toChannel(response)
  },
  async create(workspaceId: string, payload: ConnectChannelForm): Promise<Channel> {
    if (isMockMode()) {
      await mockDelay()
      const channel: Channel = {
        id: `ch_${Date.now()}`,
        name: payload.name,
        type: payload.type,
        status: 'active',
        syncStatus: 'never',
        lastSyncAt: null,
        syncInterval: payload.syncInterval,
        saveMedia: payload.saveMedia,
        totalConversations: 0,
        createdAt: new Date().toISOString(),
        appId: payload.appId,
      }
      channelState = [channel, ...channelState]
      return clone(channel)
    }
    const response = await httpClient.post<ChannelResponse>(
      endpoints.channels.list(workspaceId),
      toCreateChannelRequest(payload),
    )
    return toChannel(response)
  },
  async update(
    workspaceId: string,
    channelId: string,
    payload: ConnectChannelForm,
  ): Promise<Channel> {
    if (isMockMode()) {
      await mockDelay()
      channelState = channelState.map((item) =>
        item.id === channelId
          ? {
              ...item,
              name: payload.name,
              appId: payload.appId || item.appId,
            }
          : item,
      )
      return clone(channelState.find((item) => item.id === channelId)) as Channel
    }

    const response = await httpClient.put<ChannelResponse>(
      endpoints.channels.detail(workspaceId, channelId),
      toUpdateChannelRequest(payload),
    )
    return toChannel(response)
  },
  async sync(workspaceId: string, channelId: string): Promise<Channel | null> {
    if (isMockMode()) {
      await mockDelay(420)
      channelState = channelState.map((item) =>
        item.id === channelId
          ? { ...item, syncStatus: 'synced', lastSyncAt: new Date().toISOString() }
          : item,
      )
      return clone(channelState.find((item) => item.id === channelId) ?? null)
    }
    await httpClient.post<void>(endpoints.channels.sync(workspaceId, channelId))
    return this.get(workspaceId, channelId)
  },
  async remove(workspaceId: string, channelId: string): Promise<void> {
    if (isMockMode()) {
      await mockDelay()
      channelState = channelState.filter((item) => item.id !== channelId)
      return
    }
    await httpClient.delete(endpoints.channels.detail(workspaceId, channelId))
  },
  async createFacebookOAuthUrl(workspaceId: string): Promise<string> {
    const response = await httpClient.get<FacebookOAuthAuthorizeResponse>(
      endpoints.channels.facebookOAuthAuthorize,
      {
        query: {
          tenantId: workspaceId,
        },
      },
    )
    return response.authorizeUrl
  },
  async facebookPages(
    workspaceId: string,
    sessionId: string,
  ): Promise<FacebookPageOption[]> {
    return httpClient.get<FacebookPageOption[]>(
      endpoints.channels.facebookOAuthPages,
      {
        query: {
          tenantId: workspaceId,
          sessionId,
        },
      },
    )
  },
  async connectFacebookPage(
    workspaceId: string,
    payload: ConnectFacebookPagePayload,
  ): Promise<Channel> {
    const response = await httpClient.post<ChannelResponse>(
      endpoints.channels.facebookOAuthConnectPage,
      payload,
      {
        query: {
          tenantId: workspaceId,
        },
      },
    )
    return toChannel(response)
  },
}
