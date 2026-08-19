import SystemErrorPage from './SystemErrorPage'
import { ArrowLeft, Home, Search } from '#/components/ui/icons'

export default function NotFoundPage() {
  const currentPath =
    typeof window === 'undefined'
      ? 'đường dẫn được yêu cầu'
      : window.location.pathname

  return (
    <SystemErrorPage
      code="404"
      eyebrow="Route lookup failed"
      icon={Search}
      status="Không tìm thấy tài nguyên"
      title="Trang này đã rời khỏi bản đồ."
      description="Đường dẫn bạn mở không tồn tại, đã được đổi tên hoặc không còn thuộc workspace hiện tại."
      detail={
        <>
          Hệ thống đã kiểm tra route{' '}
          <strong className="text-slate-700">{currentPath}</strong> nhưng không
          tìm thấy điểm đến tương ứng.
        </>
      }
      tone="emerald"
      primaryAction={{
        icon: Home,
        label: 'Về trang chủ',
        onClick: () => window.location.assign('/'),
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
