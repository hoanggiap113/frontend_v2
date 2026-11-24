import type { Dispatch, SetStateAction } from 'react'
import { Input, Modal, Typography } from 'antd'
import { Building2, Plus } from '#/components/ui/icons'

function toSlug(value: string) {
  return value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

interface CreateWorkspaceModalProps {
  canSubmit: boolean
  form: { name: string; slug: string }
  onChange: Dispatch<SetStateAction<{ name: string; slug: string }>>
  onClose: () => void
  onSubmit: () => void
  submitting: boolean
}

export function CreateWorkspaceModal({
  canSubmit,
  form,
  onChange,
  onClose,
  onSubmit,
  submitting,
}: CreateWorkspaceModalProps) {
  return (
    <Modal
      open
      className="workspace-picker__modal"
      title={
        <span className="inline-flex items-center gap-2">
          <Building2 size={17} className="text-emerald-600" />
          Tạo workspace mới
        </span>
      }
      okText="Tạo workspace"
      cancelText="Hủy"
      confirmLoading={submitting}
      okButtonProps={{ disabled: !canSubmit, icon: <Plus size={14} /> }}
      closable={!submitting}
      mask={{ closable: !submitting }}
      onOk={onSubmit}
      onCancel={onClose}
    >
      <Typography.Paragraph type="secondary">
        Workspace mới sẽ xuất hiện trong danh sách để bạn chọn trước khi vào trang quản lý chung.
      </Typography.Paragraph>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Tên workspace
          </span>
          <Input
            autoFocus
            value={form.name}
            placeholder="Ví dụ: Coffee Shop"
            onChange={(event) =>
              onChange((current) => {
                const name = event.target.value
                const oldAutoSlug = toSlug(current.name)
                return {
                  ...current,
                  name,
                  slug: !current.slug || current.slug === oldAutoSlug
                    ? toSlug(name)
                    : current.slug,
                }
              })
            }
            onPressEnter={() => {
              if (canSubmit && !submitting) onSubmit()
            }}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Slug
          </span>
          <Input
            value={form.slug}
            placeholder="coffee-shop"
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                slug: event.target.value,
              }))
            }
            onPressEnter={() => {
              if (canSubmit && !submitting) onSubmit()
            }}
          />
          <Typography.Text type="secondary" className="mt-1.5 block text-xs">
            Slug dùng để định danh workspace trong hệ thống nội bộ.
          </Typography.Text>
        </label>
      </div>
    </Modal>
  )
}
