import SystemErrorPage from './SystemErrorPage'
import { AlertTriangle, Home, RefreshCw } from '#/components/ui/icons'

interface InternalServerPageProps {
  onRetry?: () => void
}

export default function InternalServerPage({
  onRetry,
}: InternalServerPageProps) {
  return (
    <SystemErrorPage
      code="500"
      eyebrow="Unexpected system fault"
      icon={AlertTriangle}
      status="Dịch vụ tạm thời gián đoạn"
      title="Một mắt xích vừa ngừng phản hồi."
      description="Máy chủ gặp sự cố khi xử lý yêu cầu. Đội vận hành có thể dùng thời điểm và đường dẫn hiện tại để truy vết nếu lỗi tiếp diễn."
      detail="Bạn có thể thử chạy lại yêu cầu. Không cần nhập lại dữ liệu đã được lưu trước đó."
      tone="rose"
      primaryAction={{
        icon: RefreshCw,
        label: 'Thử lại',
        onClick: onRetry ?? (() => window.location.reload()),
      }}
      secondaryAction={{
        icon: Home,
        label: 'Về trang chủ',
        onClick: () => window.location.assign('/'),
      }}
    />
  )
}
