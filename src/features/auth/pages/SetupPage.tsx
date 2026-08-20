import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from '#/components/ui/icons'
import {
  AuthBrand,
  AuthFooter,
  FieldWrapper,
  SubmitButton,
} from '../AuthShared'
import { authService } from '../../../lib/services/auth.service'
import { useAppDispatch } from '#/app/store/hooks'
import { setSession } from '../authSlice'

export default function SetupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    setLoading(true)
    try {
      const session = await authService.setup({ email, name, password })
      dispatch(setSession(session))
      navigate({ to: '/' })
    } catch {
      setError('Không thể hoàn tất thiết lập ban đầu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AuthBrand />
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Thiết lập tài khoản quản trị đầu tiên
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Màn này tương ứng Setup.vue ở bản Vue cũ.
            </p>
          </div>

          {error ? (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FieldWrapper label="Email">
              <Mail size={15} className="text-slate-400" />
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FieldWrapper>
            <FieldWrapper label="Tên hiển thị">
              <User size={15} className="text-slate-400" />
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FieldWrapper>
            <FieldWrapper label="Mật khẩu">
              <Lock size={15} className="text-slate-400" />
              <input
                type="password"
                className="flex-1 bg-transparent text-sm outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FieldWrapper>
            <FieldWrapper label="Nhập lại mật khẩu">
              <Lock size={15} className="text-slate-400" />
              <input
                type="password"
                className="flex-1 bg-transparent text-sm outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FieldWrapper>
            <SubmitButton
              loading={loading}
              label="Hoàn tất thiết lập"
              loadingLabel="Đang tạo tài khoản..."
            />
          </form>
        </div>
        <AuthFooter />
      </div>
    </div>
  )
}
