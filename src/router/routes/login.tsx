import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { App, Button } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail } from '#/components/ui/icons'
import { FieldWrapper } from '#/components/auth/AuthFormControls'
import { useAuth } from '#/lib/hooks/useAuth'
import { useCurrentTenant } from '#/app/providers/TenantProvider'
import { sessionQueryKey } from '../requireSession'
import { isMockMode } from '#/lib/config/env'
import { MOCK_ADMIN_CREDENTIALS } from '#/lib/services/mocks/mockAuth'

interface LoginFields {
  email: string
  password: string
  remember: boolean
}

export const Route = createFileRoute('/login')({
  beforeLoad: ({ location }) => {
    throw redirect({ href: `/auth?mode=login${location.hash}` })
  },
})

export function LoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { selectTenant } = useCurrentTenant()
  const { message } = App.useApp()
  const { loginMutation } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
    defaultValues: {
      ...(isMockMode() ? MOCK_ADMIN_CREDENTIALS : { email: '', password: '' }),
      remember: true,
    },
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })

  const onSubmit = async (value: LoginFields) => {
    try {
      const response = await loginMutation.mutateAsync(value)
      if (!response.success) {
        message.error(response.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
        return
      }
      selectTenant(null)
      queryClient.clear()
      queryClient.setQueryData(sessionQueryKey, true)
      message.success(response.message || 'Đăng nhập thành công')
      navigate({ to: '/tenants', replace: true })
    } catch (error) {
      if (import.meta.env.DEV) console.error('[auth/login] Login flow failed', { email: value.email, error })
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  return (
    <div className="auth-form-card">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {isMockMode() ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Tài khoản admin demo đã điền sẵn. Email: {MOCK_ADMIN_CREDENTIALS.email}. Mật khẩu: {MOCK_ADMIN_CREDENTIALS.password}.
          </p>
        ) : null}
        <Controller name="email" control={control} rules={{ required: 'Vui lòng nhập email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' } }} render={({ field }) => (
          <FieldWrapper label="Email" error={errors.email?.message}><Mail size={15} className="shrink-0 text-slate-400" /><input {...field} type="email" autoComplete="email" placeholder="Email / SĐT / Tên người dùng" className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></FieldWrapper>
        )} />
        <Controller name="password" control={control} rules={{ required: 'Vui lòng nhập mật khẩu' }} render={({ field }) => (
          <FieldWrapper label="Mật khẩu" error={errors.password?.message}><Lock size={15} className="shrink-0 text-slate-400" /><input {...field} type={showPass ? 'text' : 'password'} autoComplete="current-password" className="flex-1 bg-transparent text-sm text-slate-700 outline-none" /><button type="button" onClick={() => setShowPass((visible) => !visible)} aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="text-slate-400 transition-colors hover:text-slate-600">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button></FieldWrapper>
        )} />
        <Controller name="remember" control={control} render={({ field }) => <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} /><span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span></label>} />
        <Button type="primary" htmlType="submit" loading={isSubmitting} block className="mt-2 !h-12 !rounded-xl !font-semibold">{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button>
      </form>
    </div>
  )
}
