import { useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { FieldApi } from '@tanstack/react-form'
import { Mail, Lock, Eye, EyeOff } from '#/shared/ui/icons'
import { rules } from '#/shared/lib/rules'
import {
  AuthBrand,
  AuthFooter,
  FieldWrapper,
  SubmitButton,
} from '../components/AuthShared'
import { authService } from '../service/auth.service'
import { useAppDispatch } from '#/app/store/hooks'
import { setSession } from '../store/authSlice'
import { useToast } from '#/shared/components/Toast'
import { getAuthErrorFeedback } from '../lib/auth-error-helper'

interface LoginFields {
  email: string
  password: string
  remember: boolean
}

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const loginInFlight = useRef(false)
  const [showPass, setShowPass] = useState(false)

  const form = useForm<LoginFields>({
    defaultValues: {
      email: 'admin@gmail.com',
      password: '123',
      remember: true,
    },
    onSubmit: async ({ value }: { value: LoginFields }) => {
      if (loginInFlight.current) return
      loginInFlight.current = true
      try {
        const session = await authService.login(value)
        dispatch(setSession(session))
        navigate({ to: '/' })
      } catch (error) {
        const feedback = getAuthErrorFeedback(error, 'login')

        toast({
          title: feedback.title,
          description: feedback.description,
          variant: feedback.variant,
        })

        if (feedback.shouldVerifyEmail) {
          navigate({ to: '/verify-email', search: { email: value.email } })
          return
        }
      } finally {
        loginInFlight.current = false
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
              validators={{ onChange: rules.loginEmail }}
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
              validators={{ onBlur: rules.loginPassword }}
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
