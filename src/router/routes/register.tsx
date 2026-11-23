import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { App, Button } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail, User } from '#/components/ui/icons'
import { FieldWrapper } from '#/components/auth/AuthFormControls'
import { useAuth } from '#/lib/hooks/useAuth'

interface RegisterFields { email: string; name: string; password: string; confirmPassword: string }

export const Route = createFileRoute('/register')({
  beforeLoad: ({ location }) => { throw redirect({ href: `/auth?mode=register${location.hash}` }) },
})

export function RegisterForm() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { registerMutation } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { control, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<RegisterFields>({
    defaultValues: { email: '', name: '', password: '', confirmPassword: '' }, mode: 'onSubmit', reValidateMode: 'onBlur',
  })

  const onSubmit = async (value: RegisterFields) => {
    try {
      const response = await registerMutation.mutateAsync({ email: value.email, name: value.name, password: value.password })
      message.success(response.message || response.data?.message || 'Đăng ký thành công. Vui lòng kiểm tra email.')
      navigate({ to: '/verify-email', search: { email: value.email } })
    } catch (error) {
      if (import.meta.env.DEV) console.error('[auth/register] Register flow failed', error)
      message.error('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
    }
  }

  return (
    <div className="auth-form-card auth-form-card--scrollable">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller name="email" control={control} rules={{ required: 'Vui lòng nhập email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' } }} render={({ field }) => <FieldWrapper label="Email" error={errors.email?.message}><Mail size={15} className="shrink-0 text-slate-400" /><input {...field} type="email" autoComplete="email" placeholder="Email của bạn" className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></FieldWrapper>} />
        <Controller name="name" control={control} rules={{ required: 'Vui lòng nhập tên hiển thị' }} render={({ field }) => <FieldWrapper label="Tên hiển thị" error={errors.name?.message}><User size={15} className="shrink-0 text-slate-400" /><input {...field} autoComplete="name" placeholder="Tên của bạn" className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></FieldWrapper>} />
        <Controller name="password" control={control} rules={{ required: 'Vui lòng nhập mật khẩu' }} render={({ field }) => <FieldWrapper label="Mật khẩu" error={errors.password?.message}><Lock size={15} className="shrink-0 text-slate-400" /><input {...field} type={showPass ? 'text' : 'password'} autoComplete="new-password" className="flex-1 bg-transparent text-sm text-slate-700 outline-none" /><button type="button" onClick={() => setShowPass((visible) => !visible)} aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="text-slate-400">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button></FieldWrapper>} />
        <Controller name="confirmPassword" control={control} rules={{ required: 'Vui lòng nhập lại mật khẩu', validate: (value) => value === getValues('password') || 'Mật khẩu nhập lại không khớp' }} render={({ field }) => <FieldWrapper label="Nhập lại mật khẩu" error={errors.confirmPassword?.message}><Lock size={15} className="shrink-0 text-slate-400" /><input {...field} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" className="flex-1 bg-transparent text-sm text-slate-700 outline-none" /><button type="button" onClick={() => setShowConfirm((visible) => !visible)} aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="text-slate-400">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button></FieldWrapper>} />
        <Button type="primary" htmlType="submit" loading={isSubmitting} block className="mt-2 !h-12 !rounded-xl !font-semibold">{isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}</Button>
      </form>
    </div>
  )
}
