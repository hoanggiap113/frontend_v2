import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { FieldApi } from '@tanstack/react-form'
import { App } from 'antd'
import { Mail, User, Lock, Eye, EyeOff } from '#/components/ui/icons'
import { useAuth } from '#/lib/hooks/useAuth'
import {
  AuthBrand,
  AuthFooter,
  FieldWrapper,
  SubmitButton,
} from '../AuthShared'

interface RegisterFields {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { registerMutation } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<RegisterFields>({
    defaultValues: { email: '', name: '', password: '', confirmPassword: '' },

    onSubmit: async ({ value }: { value: RegisterFields }) => {
      try {
        const response = await registerMutation.mutateAsync({
          email: value.email,
          name: value.name,
          password: value.password,
        })
        message.success(
          response.message ||
            response.data?.message ||
            'Đăng ký thành công. Vui lòng kiểm tra email.',
        )
        navigate({ to: '/verify-email', search: { email: value.email } })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[auth/register] Register flow failed', error)
        }
        message.error('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    },
  })

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-4 font-[Be_Vietnam_Pro,sans-serif]">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <AuthBrand />
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800">Tạo tài khoản</h2>
            <p className="text-sm text-slate-500 mt-1">
              Tạo tài khoản người dùng / quản trị viên
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
              {(field: FieldApi<RegisterFields, 'email'>) => (
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
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                  />
                </FieldWrapper>
              )}
            </form.Field>

            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  value.trim() ? undefined : 'Vui lòng nhập tên hiển thị',
              }}
            >
              {(field: FieldApi<RegisterFields, 'name'>) => (
                <FieldWrapper
                  label="Tên hiển thị"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <User size={15} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="name"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                  />
                </FieldWrapper>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  value ? undefined : 'Vui lòng nhập mật khẩu',
              }}
            >
              {(field: FieldApi<RegisterFields, 'password'>) => (
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
                    autoComplete="new-password"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
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

            <form.Field
              name="confirmPassword"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Vui lòng nhập lại mật khẩu'
                  if (value !== form.getFieldValue('password')) {
                    return 'Mật khẩu nhập lại không khớp'
                  }
                  return undefined
                },
              }}
            >
              {(field: FieldApi<RegisterFields, 'confirmPassword'>) => (
                <FieldWrapper
                  label="Nhập lại mật khẩu"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <Lock size={15} className="text-slate-400 shrink-0" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="new-password"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </FieldWrapper>
              )}
            </form.Field>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <SubmitButton
                  loading={isSubmitting}
                  label="Tạo tài khoản"
                  loadingLabel="Đang xử lý..."
                />
              )}
            </form.Subscribe>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
        <AuthFooter />
      </div>
    </div>
  )
}
