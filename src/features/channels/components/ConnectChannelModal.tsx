import type { ReactNode } from 'react'
import { useForm, type FieldApi } from '@tanstack/react-form'
import { clsx } from 'clsx'
import { ExternalLink, Info, X } from '#/components/ui/icons'
import {
  CHANNEL_TYPE_OPTIONS,
  SYNC_INTERVAL_OPTIONS,
} from '../../../lib/helpers/channel-helper'
import { rules } from '#/lib/rules'
import type {
  ChannelType,
  ConnectChannelForm,
  SyncInterval,
} from '../../../lib/types/channel'

interface Props {
  initialValues?: ConnectChannelForm
  mode?: 'create' | 'edit'
  error?: string
  facebookOAuthSubmitting?: boolean
  submitting?: boolean
  onClose: () => void
  onFacebookOAuth?: () => void
  onSuccess: (data: ConnectChannelForm) => void | Promise<void>
}

function FieldRow({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span>!</span>
          {error}
        </p>
      )}
    </div>
  )
}

interface TextInputField {
  state: {
    value: string
    meta: {
      errors: readonly unknown[]
    }
  }
  handleChange: (value: string) => void
  handleBlur: () => void
}

function TextInput({
  field,
  placeholder,
  type = 'text',
}: {
  field: TextInputField
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      className={clsx(
        'w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition-all',
        'focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100',
        field.state.meta.errors.length
          ? 'border-red-300 bg-red-50'
          : 'border-slate-200',
      )}
    />
  )
}

const defaultValues: ConnectChannelForm = {
  type: 'facebook',
  name: '',
  appId: '',
  appSecret: '',
  syncInterval: '15',
  saveMedia: false,
}

export default function ConnectChannelModal({
  initialValues,
  mode = 'create',
  error,
  facebookOAuthSubmitting = false,
  submitting = false,
  onClose,
  onFacebookOAuth,
  onSuccess,
}: Props) {
  const isEdit = mode === 'edit'

  const form = useForm<ConnectChannelForm>({
    defaultValues: initialValues ?? defaultValues,
    onSubmit: async ({ value }: { value: ConnectChannelForm }) => {
      await onSuccess(value)
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-800">
            {isEdit ? 'Cập nhật kênh' : 'Kết nối kênh mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form
          className="space-y-5 px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="type">
            {(field: FieldApi<ConnectChannelForm, 'type'>) => (
              <FieldRow label="Loại kênh">
                <select
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value as ChannelType)
                  }
                  disabled={isEdit}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {CHANNEL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
            )}
          </form.Field>

          <form.Subscribe>
            {(state) => {
              const selectedType = state.values.type
              const isZalo = selectedType === 'zalo_oa'
              const isPancake = selectedType === 'pancake'
              const isFacebook = selectedType === 'facebook'
              const appIdLabel = isZalo
                ? 'App ID'
                : isPancake
                  ? 'Pancake Page ID'
                  : 'Facebook Page ID'
              const tokenLabel = isZalo
                ? 'App Secret'
                : isPancake
                  ? 'Pancake Access Token'
                  : 'Page Access Token'
              const appIdHint = isZalo
                ? 'Lấy từ Zalo Developers'
                : isPancake
                  ? 'Page ID của gian hàng/trang trên Pancake'
                  : 'Facebook Page ID'
              const appIdPlaceholder = isZalo
                ? 'VD: 3456789012'
                : isPancake
                  ? 'VD: 123456789 hoặc page_slug'
                  : 'VD: 123456789'

              return (
                <>
                  <form.Field
                    name="name"
                    validators={{ onBlur: rules.required('Tên kênh') }}
                  >
                    {(field: FieldApi<ConnectChannelForm, 'name'>) => (
                      <FieldRow
                        label="Tên kênh"
                        error={field.state.meta.errors[0]?.toString()}
                      >
                        <TextInput
                          field={field}
                          placeholder="VD: Coffee Shop Fanpage"
                        />
                      </FieldRow>
                    )}
                  </form.Field>

                  {!isEdit &&
                    (isFacebook && onFacebookOAuth ? (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Kết nối nhanh bằng Facebook
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Đăng nhập Facebook rồi chọn Page, không cần tự lấy Page ID và token.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={onFacebookOAuth}
                            disabled={submitting || facebookOAuthSubmitting}
                            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-60"
                          >
                            {facebookOAuthSubmitting
                              ? 'Đang mở Facebook...'
                              : 'Đăng nhập Facebook'}
                          </button>
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                          <div className="h-px flex-1 bg-blue-100" />
                          <span>hoặc nhập thủ công bên dưới</span>
                          <div className="h-px flex-1 bg-blue-100" />
                        </div>
                        <a
                          href="https://developers.facebook.com/tools/explorer/"
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink size={13} />
                          Mở Facebook Graph API Explorer
                        </a>
                      </div>
                    ) : isPancake ? (
                      <div className="flex gap-2.5 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                        <Info size={15} className="mt-0.5 shrink-0" />
                        <span>
                          Nhập Page ID và Access Token của Pancake. Hệ thống sẽ
                          kiểm tra kết nối trước khi lưu kênh.
                        </span>
                      </div>
                    ) : (
                      <a
                        href="https://developers.facebook.com/tools/explorer/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600"
                      >
                        <ExternalLink size={14} />
                        Hướng dẫn lấy {appIdLabel} và {tokenLabel}
                      </a>
                    ))}

                  <form.Field
                    name="appId"
                    validators={{ onBlur: rules.required(appIdLabel) }}
                  >
                    {(field: FieldApi<ConnectChannelForm, 'appId'>) => (
                      <FieldRow
                        label={appIdLabel}
                        hint={appIdHint}
                        error={field.state.meta.errors[0]?.toString()}
                      >
                        <TextInput
                          field={field}
                          placeholder={appIdPlaceholder}
                        />
                      </FieldRow>
                    )}
                  </form.Field>

                  <form.Field
                    name="appSecret"
                    validators={
                      isEdit
                        ? undefined
                        : { onBlur: rules.required(tokenLabel) }
                    }
                  >
                    {(field: FieldApi<ConnectChannelForm, 'appSecret'>) => (
                      <FieldRow
                        label={tokenLabel}
                        hint={
                          isEdit ? 'Để trống nếu không đổi token' : undefined
                        }
                        error={field.state.meta.errors[0]?.toString()}
                      >
                        <TextInput
                          field={field}
                          type="password"
                          placeholder={
                            isEdit
                              ? 'Không đổi token hiện tại'
                              : '••••••••••••••••'
                          }
                        />
                      </FieldRow>
                    )}
                  </form.Field>

                  {isZalo && (
                    <div className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span>Zalo OA hiện chưa khả dụng.</span>
                    </div>
                  )}
                </>
              )
            }}
          </form.Subscribe>

          <form.Field name="syncInterval">
            {(field: FieldApi<ConnectChannelForm, 'syncInterval'>) => (
              <FieldRow label="Chu kỳ đồng bộ">
                <select
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value as SyncInterval)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  {SYNC_INTERVAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
            )}
          </form.Field>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-slate-600 disabled:pointer-events-none disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting
                ? 'Đang xử lý...'
                : isEdit
                  ? 'Lưu thay đổi'
                  : 'Kết nối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
