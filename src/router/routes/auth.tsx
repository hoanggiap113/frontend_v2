import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Tabs } from 'antd'
import { AuthExperienceLayout } from '#/components/auth/AuthExperienceLayout'
import { LoginForm } from './login'
import { RegisterForm } from './register'

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === 'register' ? 'register' as const : 'login' as const,
  }),
  component: AuthPage,
})

function AuthPage() {
  const { mode } = Route.useSearch()
  const navigate = useNavigate()

  return (
    <AuthExperienceLayout>
      <div className="auth-panel">
        <header className="auth-panel__header">
          <h2>Đăng nhập hoặc đăng ký</h2>
          <p>Truy cập không gian quản lý khách hàng của bạn.</p>
        </header>
        <Tabs
          activeKey={mode}
          onChange={(key) => navigate({ to: '/auth', search: { mode: key as 'login' | 'register' } })}
          items={[
            { key: 'login', label: 'Đăng nhập', children: <LoginForm /> },
            { key: 'register', label: 'Đăng ký', children: <RegisterForm /> },
          ]}
        />
      </div>
    </AuthExperienceLayout>
  )
}
