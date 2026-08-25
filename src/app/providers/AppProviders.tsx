import type { ReactNode } from 'react'
import { App as AntdApp, ConfigProvider } from 'antd'
import type { ThemeConfig } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '#/lib/config/queryClient'
import GuardProvider from './GuardProvider'
import TenantProvider from './TenantProvider'
import 'antd/dist/reset.css'

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#0f8f4e',
    colorSuccess: '#0f8f4e',
    colorInfo: '#1677ff',
    colorWarning: '#d99700',
    colorError: '#d9363e',
    colorText: '#17202a',
    colorTextSecondary: '#667085',
    colorBorder: '#e4e7ec',
    colorBgLayout: '#f5f6f7',
    colorBgContainer: '#ffffff',
    borderRadius: 8,
    borderRadiusLG: 10,
    borderRadiusSM: 6,
    controlHeight: 40,
    fontFamily:
      "Manrope, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadowSecondary: '0 12px 32px rgba(16, 24, 40, 0.10)',
  },
  components: {
    Button: {
      fontWeight: 650,
      primaryShadow: '0 4px 12px rgba(15, 143, 78, 0.18)',
    },
    Card: {
      headerBg: '#ffffff',
    },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 42,
      itemMarginBlock: 3,
      itemSelectedBg: '#e9f7ef',
      itemSelectedColor: '#0b7a43',
      itemHoverBg: '#f5f7f6',
      itemHoverColor: '#0b7a43',
    },
    Table: {
      headerBg: '#fafbfb',
      headerColor: '#667085',
      borderColor: '#eef0f2',
      rowHoverBg: '#f8fbf9',
    },
    Tabs: {
      itemSelectedColor: '#0f8f4e',
      itemHoverColor: '#0f8f4e',
      inkBarColor: '#0f8f4e',
    },
  },
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GuardProvider>
        <TenantProvider>
          <ConfigProvider locale={viVN} theme={theme}>
            <AntdApp>{children}</AntdApp>
          </ConfigProvider>
        </TenantProvider>
      </GuardProvider>
    </QueryClientProvider>
  )
}
