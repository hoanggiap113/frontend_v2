export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
    resendOtp: '/auth/resend-otp',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  workspaces: {
    list: '/tenants/me',
    create: '/tenants',
    detail: (workspaceId: string) => `/tenants/${workspaceId}`,
  },
  channels: {
    list: (workspaceId: string) => `/tenants/${workspaceId}/channels`,
    detail: (workspaceId: string, channelId: string) =>
      `/tenants/${workspaceId}/channels/${channelId}`,
    sync: (workspaceId: string, channelId: string) =>
      `/tenants/${workspaceId}/channels/${channelId}/sync`,
    facebookOAuthAuthorize: '/channels/facebook/oauth/authorize',
    facebookOAuthPages: '/channels/facebook/oauth/pages',
    facebookOAuthConnectPage: '/channels/facebook/oauth/connect-page',
  },
  conversations: {
    list: (workspaceId: string) => `/tenants/${workspaceId}/conversations`,
    detail: (workspaceId: string, conversationId: string) =>
      `/tenants/${workspaceId}/conversations/${conversationId}`,
    insights: (workspaceId: string, conversationId: string) =>
      `/tenants/${workspaceId}/conversations/${conversationId}/insights`,
    responsible: (workspaceId: string, conversationId: string) =>
      `/tenants/${workspaceId}/conversations/${conversationId}/responsible`,
    messages: (
      workspaceId: string,
      conversationId: string,
      channelId: string,
    ) =>
      `/tenants/${workspaceId}/conversations/${conversationId}/channels/${channelId}/messages`,
    messageDetail: (
      workspaceId: string,
      conversationId: string,
      messageId: string,
    ) =>
      `/tenants/${workspaceId}/conversations/${conversationId}/messages/${messageId}`,
  },
  jobs: {
    list: (workspaceId: string) => `/tenants/${workspaceId}/jobs`,
    detail: (workspaceId: string, jobId: string) =>
      `/tenants/${workspaceId}/jobs/${jobId}`,
    runs: (workspaceId: string, jobId: string) =>
      `/tenants/${workspaceId}/jobs/${jobId}/runs`,
    trigger: (workspaceId: string, jobId: string) =>
      `/tenants/${workspaceId}/jobs/${jobId}/trigger`,
  },
  settings: {
    gemini: (workspaceId: string) => `/tenants/${workspaceId}/settings/gemini`,
  },
  users: {
    list: (workspaceId: string) => `/tenants/${workspaceId}/members`,
    member: (workspaceId: string, userId: string) =>
      `/tenants/${workspaceId}/members/${userId}`,
    invite: (workspaceId: string) => `/tenants/${workspaceId}/invitations`,
    leave: (workspaceId: string) => `/tenants/${workspaceId}/leave`,
  },
  invitations: {
    detail: (token: string) => `/invitations/${token}`,
    accept: (token: string) => `/invitations/${token}/accept`,
  },
  dashboard: {
    overview: (workspaceId: string) =>
      `/tenants/${workspaceId}/dashboard/overview`,
    agents: (workspaceId: string) => `/tenants/${workspaceId}/dashboard/agents`,
    scoreTrend: (workspaceId: string) =>
      `/tenants/${workspaceId}/dashboard/score-trend`,
    tags: (workspaceId: string) => `/tenants/${workspaceId}/dashboard/tags`,
    jobRuns: (workspaceId: string) =>
      `/tenants/${workspaceId}/dashboard/job-runs`,
  },
  agent: {
    health: '/agent/health',
    models: '/models',
    chat: '/agent/chat',
    approve: '/agent/approve',
    reject: '/agent/reject',
    sessions: '/agent/sessions',
    sessionMessages: (sessionId: string) =>
      `/agent/sessions/${sessionId}/messages`,
    testKey: '/agent/test-key',
  },
}
