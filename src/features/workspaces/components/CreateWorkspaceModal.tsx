import type { Dispatch, SetStateAction } from 'react'
import { Input, Modal, Typography } from 'antd'
import { Building2, Plus } from '#/components/ui/icons'

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
      maskClosable={!submitting}
      onOk={onSubmit}
      onCancel={onClose}
    >
      <Typography.Paragraph type="secondary">
        Workspace mới sẽ được chọn làm workspace hiện tại sau khi tạo thành công.
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
              onChange((current) => ({
                ...current,
                name: event.target.value,
              }))
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
