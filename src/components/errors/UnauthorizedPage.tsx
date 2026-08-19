import SystemErrorPage from './SystemErrorPage'
import { ArrowLeft, Lock, LogOut } from '#/components/ui/icons'

export default function UnauthorizedPage() {
  return (
    <SystemErrorPage
      code="401"
      eyebrow="Authentication required"
      icon={Lock}
      status="Phiên truy cập bị từ chối"
      title="Bạn chưa có chìa khóa cho khu vực này."
      description="Phiên đăng nhập có thể đã hết hạn hoặc tài khoản hiện tại chưa được xác thực. Đăng nhập lại để tiếp tục công việc."
      detail="Dữ liệu của bạn vẫn an toàn. Hệ thống chỉ tạm dừng yêu cầu cho đến khi danh tính được xác nhận lại."
      tone="amber"
      primaryAction={{
        icon: LogOut,
        label: 'Đăng nhập lại',
        onClick: () => window.location.assign('/login'),
      }}
      secondaryAction={{
        icon: ArrowLeft,
        label: 'Quay lại',
        onClick: () => {
          if (window.history.length > 1) window.history.back()
          else window.location.assign('/')
        },
      }}
    />
  )
}
