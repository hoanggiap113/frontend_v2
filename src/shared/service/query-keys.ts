export const queryKeys = {
  auth: ['auth'] as const,
  profile: ['auth', 'profile'] as const,
  workspaces: ['workspaces'] as const,
  channels: (workspaceId: string) =>
    ['workspaces', workspaceId, 'channels'] as const,
  channelDetail: (workspaceId: string, channelId: string) =>
    ['workspaces', workspaceId, 'channels', channelId] as const,
  conversations: (workspaceId: string) =>
    ['workspaces', workspaceId, 'conversations'] as const,
  conversationDetail: (workspaceId: string, conversationId: string) =>
    ['workspaces', workspaceId, 'conversations', conversationId] as const,
  conversationMessages: (workspaceId: string, conversationId: string) =>
    [
      'workspaces',
      workspaceId,
      'conversations',
      conversationId,
      'messages',
    ] as const,
  jobs: (workspaceId: string) => ['workspaces', workspaceId, 'jobs'] as const,
  jobDetail: (workspaceId: string, jobId: string) =>
    ['workspaces', workspaceId, 'jobs', jobId] as const,
  jobRuns: (workspaceId: string, jobId: string) =>
    ['workspaces', workspaceId, 'jobs', jobId, 'runs'] as const,
  jobResults: (workspaceId: string, jobId: string) =>
    ['workspaces', workspaceId, 'jobs', jobId, 'results'] as const,
  users: (workspaceId: string) => ['workspaces', workspaceId, 'users'] as const,
  geminiSettings: (workspaceId: string) =>
    ['workspaces', workspaceId, 'settings', 'gemini'] as const,
  activityLogs: (workspaceId: string) =>
    ['workspaces', workspaceId, 'activity-logs'] as const,
  dashboardOverview: (workspaceId: string, filterKey = 'default') =>
    ['workspaces', workspaceId, 'dashboard', 'overview', filterKey] as const,
  dashboardAgents: (workspaceId: string, filterKey = 'default') =>
    ['workspaces', workspaceId, 'dashboard', 'agents', filterKey] as const,
  dashboardScoreTrend: (workspaceId: string, filterKey = 'default') =>
    ['workspaces', workspaceId, 'dashboard', 'score-trend', filterKey] as const,
  dashboardTags: (workspaceId: string) =>
    ['workspaces', workspaceId, 'dashboard', 'tags'] as const,
  dashboardJobRuns: (workspaceId: string, filterKey = 'default') =>
    ['workspaces', workspaceId, 'dashboard', 'job-runs', filterKey] as const,
} as const
