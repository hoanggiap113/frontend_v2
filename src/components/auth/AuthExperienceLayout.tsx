import type { ReactNode } from 'react'
import banner from '#/assets/login-banner.jpg'

interface AuthExperienceLayoutProps {
  children: ReactNode
}

const highlights = [
  'Quản lý hội thoại đa nền tảng tập trung, hiệu quả',
  'Chăm sóc khách hàng và chốt đơn tự động với AI Agent',
  'Quản lý đơn hàng và tối ưu quảng cáo tự động với CAPI',
  'Quản lý khách hàng đa kênh với CRM',
]

export function AuthExperienceLayout({ children }: AuthExperienceLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-intro" aria-label="Giới thiệu Gom-message">
        <a className="auth-brand" href="/auth" aria-label="Gom-message, trang xác thực">
          <span className="auth-brand__mark">G</span>
          <span>Gom-message</span>
        </a>
        <div className="auth-intro__content">
          <img className="auth-intro__image" src={banner} alt="" />
          <div className="auth-intro__copy">
            <p className="auth-eyebrow">NỀN TẢNG VẬN HÀNH BÁN HÀNG</p>
            <h1>Bắt đầu ngay hôm nay <span aria-hidden="true">🥰</span></h1>
            <p className="auth-intro__description">
              Dùng thử miễn phí — khởi đầu chăm sóc khách hàng thông minh và hiệu quả.
            </p>
            <ul>
              {highlights.map((highlight) => (
                <li key={highlight}><span aria-hidden="true">✓</span>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
        <span className="auth-intro__glow" aria-hidden="true" />
      </section>
      <section className="auth-main">
        <div className="auth-main__content">{children}</div>
        <footer className="auth-footer">
          <span>Copyright © {new Date().getFullYear()} Gom-message</span>
          <a href="https://pancake.vn/privacy-policy" target="_blank" rel="noreferrer">Chính sách bảo mật</a>
        </footer>
      </section>
    </main>
  )
}
