export const endpoints = {
  auth: { login: '/auth/login', register: '/auth/register', verifyEmail: '/auth/verify-email', resendOtp: '/auth/resend-otp', refresh: '/auth/refresh', logout: '/auth/logout' },
  workspaces: { list: '/tenants', create: '/tenants', detail: (workspaceId: string) => `/tenants/${workspaceId}` },
} as const
