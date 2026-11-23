import { useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { FieldApi } from '@tanstack/react-form'
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from '#/components/ui/icons'
import { AuthLayout } from '#/components/auth/AuthLayout'
import { authService } from '../../../lib/services/auth.service'

interface VerifyEmailFields {
  otp: string
}

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const { email } = useSearch({ from: '/verify-email' })

  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  )

  if (!email) {
    navigate({ to: '/register' })
    return null
  }

  const form = useForm<VerifyEmailFields>({
    defaultValues: { otp: '' },
    onSubmit: async ({ value }: { value: VerifyEmailFields }) => {
      setServerError(null)
      try {
        await authService.verifyEmail(email, value.otp)
        setDone(true)
        setTimeout(() => navigate({ to: '/login' }), 900)
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Xác thực OTP thất bại'
        const attempts = error?.data?.metadata?.remainingAttempts
        if (attempts !== undefined) {
          setRemainingAttempts(attempts)
        }
        setServerError(message)
      }
    },
  })

  const handleResendOtp = async () => {
    setIsResending(true)
    setResendSuccess(false)
    try {
      await authService.resendOtp(email)
      setResendSuccess(true)
      setServerError(null)
      setRemainingAttempts(null)
      setTimeout(() => setResendSuccess(false), 6000)
    } catch (error: any) {
      setServerError(error?.message || 'Gửi lại OTP thất bại')
    } finally {
      setIsResending(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Xác thực thành công!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Email của bạn đã được xác thực. Đang chuyển về trang đăng nhập...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Vào hệ thống <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail size={20} className="text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Xác thực email</h2>
            <p className="text-sm text-slate-500 mt-1">
              Nhập mã OTP được gửi đến <br />
              <span className="font-semibold text-slate-700">{email}</span>
            </p>
          </div>

          {serverError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p>{serverError}</p>
                {remainingAttempts !== null && (
                  <p className="text-xs mt-1 opacity-80">
                    Còn {remainingAttempts} lần thử
                  </p>
                )}
              </div>
            </div>
          )}

          {resendSuccess && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-5 animate-in fade-in duration-200">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-emerald-500"
              />
              <span>OTP mới đã được gửi đến email của bạn</span>
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="otp"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'OTP không được bỏ trống'
                },
              }}
            >
              {(field: FieldApi<VerifyEmailFields, 'otp'>) => (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mã OTP (6 chữ số)
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={field.state.value}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6)
                        field.handleChange(val)
                      }}
                      onBlur={field.handleBlur}
                      className="flex-1 bg-transparent text-2xl text-center text-slate-700 outline-none tracking-widest"
                    />
                  </div>
                  {field.state.meta.errors[0] && (
                    <p className="text-red-500 text-xs mt-2">
                      {field.state.meta.errors[0]?.toString()}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <button
              type="submit"
              disabled={form.state.isSubmitting}
              className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl transition-colors"
            >
              {form.state.isSubmitting ? 'Đang xử lý...' : 'Xác thực Email'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-700 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} />
              {isResending ? 'Đang gửi...' : 'Gửi lại OTP'}
            </button>
            <Link
              to="/register"
              className="block w-full text-center text-slate-600 hover:text-slate-700 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Quay lại đăng ký
            </Link>
          </div>
      </div>
    </AuthLayout>
  )
}
