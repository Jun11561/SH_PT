import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { requestPrint, type PrintRequest } from '../api/client'
import { Header } from '../components/Header'
import './StatusPage.css'

/**
 * 5. 출력중 화면
 * 진입 시 requestPrint() 를 호출하고, 완료되면 /done 으로 이동합니다.
 */
export function PrintingPage() {
  const navigate = useNavigate()
  const location = useLocation() as { pathname: string; state?: { payload?: PrintRequest } }
  // 히스토리 state는 새로고침/앞으로가기 때 남아 있어 재출력을 유발하므로, 최초 값만 보관하고 state는 비운다
  const [payload] = useState(() => location.state?.payload)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    // StrictMode의 이펙트 이중 실행에서도 한 번만 요청
    if (!payload || started.current) return
    started.current = true
    navigate(location.pathname, { replace: true, state: null })
    requestPrint(payload)
      .then(() => mounted.current && navigate('/done', { replace: true }))
      .catch((e: Error) => mounted.current && setError(e.message))
  }, [payload, navigate, location.pathname])

  if (!payload) return <Navigate to="/select" replace />

  return (
    <div className="page status">
      <Header back onBack={() => navigate(-1)} />
      <div className="page__body status__body">
        <p className="status__text">
          아티스트 결과를 출력하고 있습니다.
          <br />
          출력이 완료되면 결과물을 가져가 주세요.
        </p>

        <div className="status__icon">
          <PrinterIcon />
        </div>
        <p className="status__caption status__caption--printing">{error ? '출력에 실패했습니다' : '출력중 · · ·'}</p>

        {error && (
          <button className="btn btn--primary status__retry" onClick={() => navigate(-1)}>
            돌아가기
          </button>
        )}
      </div>
    </div>
  )
}

/** Figma: 검은 프린터 + 사진이 나오는 모양 (91 x 73) */
function PrinterIcon() {
  return (
    <svg width="91" height="73" viewBox="0 0 91 73" fill="none" aria-hidden="true" style={{ width: 'calc(91 * var(--u))', height: 'auto' }}>
      <rect x="22" y="0" width="47" height="16" rx="3" fill="#111" />
      <rect x="0" y="13" width="91" height="42" rx="9" fill="#111" />
      <circle cx="79" cy="24" r="2.5" fill="#fff" />
      <rect x="13" y="38" width="65" height="5" rx="2.5" fill="#fff" />
      <rect x="20.5" y="40.5" width="50" height="31" rx="3" fill="#fff" stroke="#111" strokeWidth="3" />
      <path d="M28 64.5 37.5 54l7 7 5-5 12 8.5" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="56" cy="49" r="3" fill="#111" />
    </svg>
  )
}
