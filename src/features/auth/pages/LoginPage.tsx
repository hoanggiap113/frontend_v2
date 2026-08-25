import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { FieldApi } from '@tanstack/react-form'
import { App } from 'antd'
import { Mail, Lock, Eye, EyeOff } from '#/components/ui/icons'
import { useAuth } from '#/lib/hooks/useAuth'
import {
  AuthBrand,
  AuthFooter,
  FieldWrapper,
  SubmitButton,
} from '../AuthShared'

interface LoginFields {
  email: string
  password: string
  remember: boolean
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { loginMutation } = useAuth()
  const [showPass, setShowPass] = useState(false)

  const form = useForm<LoginFields>({
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
    onSubmit: async ({ value }: { value: LoginFields }) => {
      try {
        const response = await loginMutation.mutateAsync(value)
        message.success(response.message || 'Đăng nhập thành công')
        navigate({ to: '/tenants' })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[auth/login] Login flow failed', {
            email: value.email,
            error,
          })
        }

        message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    },
  })

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-4 font-[Be_Vietnam_Pro,sans-serif]">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <AuthBrand />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800">
              Chào mừng trở lại
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Đăng nhập để tiếp tục quản lý hệ thống
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) return 'Vui lòng nhập email'
                  if (!/^\S+@\S+\.\S+$/.test(value)) return 'Email không hợp lệ'
                  return undefined
                },
              }}
            >
              {(field: FieldApi<LoginFields, 'email'>) => (
                <FieldWrapper
                  label="Email"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <Mail size={15} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="email"
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </FieldWrapper>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) =>
                  value ? undefined : 'Vui lòng nhập mật khẩu',
              }}
            >
              {(field: FieldApi<LoginFields, 'password'>) => (
                <FieldWrapper
                  label="Mật khẩu"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <Lock size={15} className="text-slate-400 shrink-0" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="current-password"
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </FieldWrapper>
              )}
            </form.Field>

            <form.Field name="remember">
              {(field: FieldApi<LoginFields, 'remember'>) => (
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <span className="text-sm text-slate-600">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
              )}
            </form.Field>

            <form.Subscribe
              selector={(s: { isSubmitting: boolean }) => s.isSubmitting}
            >
              {(isSubmitting: boolean) => (
                <SubmitButton
                  loading={isSubmitting}
                  label="Đăng nhập"
                  loadingLabel="Đang đăng nhập..."
                />
              )}
            </form.Subscribe>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Tạo tài khoản
            </Link>{' '}
            •{' '}
            <Link
              to="/setup"
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Setup ban đầu
            </Link>
          </p>
        </div>

        <AuthFooter />
      </div>
    </div>
  )
}
