import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from '#/components/ui/icons'
import { FieldWrapper } from '#/components/auth/AuthFormControls'
import { AuthLayout } from '#/components/auth/AuthLayout'
import { setSession } from '#/features/auth'
import { invitationsService } from '../../lib/services/invitations.service'
import { useAppDispatch } from '#/app/store/hooks'
import { formatDate } from '#/lib/helpers/datetime-helper'
import { getPasswordConfirmationError } from '#/lib/helpers/validation-helper'
import LoadingState from '#/components/ui/LoadingState'

interface AcceptInvitationPageProps {
  token: string
}

export default function AcceptInvitationPage({
  token,
}: AcceptInvitationPageProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    data: invitation,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['invitations', token],
    queryFn: () => invitationsService.getInfo(token),
  })

  const passwordError = useMemo(() => {
    if (!invitation || invitation.accountExists) return ''
    return getPasswordConfirmationError({ confirmPassword, password })
  }, [confirmPassword, invitation, password])

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!invitation) throw new Error('Invitation không hợp lệ')
      return invitationsService.accept(
        token,
        invitation.accountExists
          ? {}
          : {
              name: name.trim() || undefined,
              password,
            },
      )
    },
    onSuccess: () => {
      if (!invitation) return
      const displayName =
        name.trim() || invitation.email.split('@')[0] || invitation.email

      dispatch(
        setSession({
          user: {
            id: invitation.email,
            email: invitation.email,
            name: displayName,
            role: invitation.role,
            permissions: [
              'channels:rw',
              'messages:rw',
              'jobs:rw',
              'users:rw',
              'settings:rw',
            ],
          },
        }),
      )

      navigate({ to: '/' })
    },
  })

  const canSubmit =
    Boolean(invitation) &&
    !acceptMutation.isPending &&
    (invitation?.accountExists || !passwordError)

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800">
              Chấp nhận lời mời
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tham gia workspace được chia sẻ với bạn.
            </p>
          </div>

          {isLoading ? (
            <LoadingState
              title="Đang tải lời mời"
              description="Thông tin workspace được mời sẽ xuất hiện sau khi tải xong."
              className="p-5"
            />
          ) : null}

          {error ? (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Invitation không tồn tại, đã dùng hoặc đã hết hạn.</span>
            </div>
          ) : null}

          {invitation ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={15} />
                  {invitation.tenantName}
                </div>
                <div className="mt-2 leading-6">
                  <div>Email: {invitation.email}</div>
                  <div>Vai trò: {invitation.role}</div>
                  <div>Hết hạn: {formatDate(invitation.expiresAt)}</div>
                </div>
              </div>

              {!invitation.accountExists ? (
                <div className="space-y-4">
                  <FieldWrapper label="Email">
                    <Mail size={15} className="shrink-0 text-slate-400" />
                    <input
                      value={invitation.email}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-slate-500 outline-none"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Tên hiển thị">
                    <User size={15} className="shrink-0 text-slate-400" />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    label="Mật khẩu"
                    error={password && password.length < 6 ? passwordError : ''}
                  >
                    <Lock size={15} className="shrink-0 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </FieldWrapper>

                  <FieldWrapper
                    label="Nhập lại mật khẩu"
                    error={
                      confirmPassword && confirmPassword !== password
                        ? passwordError
                        : ''
                    }
                  >
                    <Lock size={15} className="shrink-0 text-slate-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((value) => !value)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </FieldWrapper>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Email này đã có tài khoản. Bấm chấp nhận để tham gia
                  workspace.
                </div>
              )}

              {acceptMutation.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {acceptMutation.error instanceof Error
                    ? acceptMutation.error.message
                    : 'Không chấp nhận được lời mời.'}
                </div>
              ) : null}

              <button
                onClick={() => acceptMutation.mutate()}
                disabled={!canSubmit}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-600 disabled:opacity-60"
              >
                {acceptMutation.isPending
                  ? 'Đang xử lý...'
                  : invitation.accountExists
                    ? 'Chấp nhận lời mời'
                    : 'Tạo tài khoản và tham gia'}
              </button>
            </div>
          ) : null}
      </div>
    </AuthLayout>
  )
}
