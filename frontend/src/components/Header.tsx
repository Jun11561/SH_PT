import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'

interface Props {
  /** 뒤로가기 버튼 표시 */
  back?: boolean
  /** 로고 표시 */
  logo?: boolean
  onBack?: () => void
}

export function Header({ back = false, logo = true, onBack }: Props) {
  const navigate = useNavigate()
  return (
    <header className="header">
      {back && (
        <button className="header__back" aria-label="뒤로가기" onClick={onBack ?? (() => navigate(-1))}>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" style={{ width: 'calc(12 * var(--u))', height: 'auto' }}>
            <path d="M10.5 1.5 2 10l8.5 8.5" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {logo && <Logo />}
    </header>
  )
}
