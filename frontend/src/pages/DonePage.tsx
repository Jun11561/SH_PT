import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import './StatusPage.css'

/** 6. 완료 화면 */
export function DonePage() {
  const navigate = useNavigate()
  return (
    <div className="page status">
      {/* 출력이 끝난 뒤이므로 이전 화면(출력중)으로 돌아가지 않고 선택 화면으로 교체 */}
      <Header back onBack={() => navigate('/select', { replace: true })} />
      <div className="page__body status__body status__body--center">
        <div className="status__check">
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" style={{ width: 'calc(88 * var(--u))', height: 'auto' }}>
            <circle cx="44" cy="44" r="40" stroke="#3467e5" strokeWidth="4" />
            <path d="M26 45.5 38.5 58 63 33" stroke="#3467e5" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="status__caption status__caption--done">완료되었습니다 !</p>
      </div>
    </div>
  )
}
