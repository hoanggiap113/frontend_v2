export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  agentApiBaseUrl:
    import.meta.env.VITE_AGENT_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  dataSource: (import.meta.env.VITE_DATA_SOURCE ?? 'mock') as 'mock' | 'api',
  appName: 'Chat Quality Agent',
}

export const isMockMode = () => appConfig.dataSource !== 'api'
