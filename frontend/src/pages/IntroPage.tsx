import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { appConfig } from '../config/appConfig'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { LAST_SELECTED_KEY } from './ArtistSelectPage'
import './IntroPage.css'

/**
 * 1. 시작 안내 화면 (NFC 태깅 직후)
 * - requireTapToStart=true : 화면 아무 곳이나 터치 → 오디오 잠금 해제 → 잠시 후 아티스트 선택으로 이동
 * - requireTapToStart=false: introDurationMs 후 자동 이동
 *
 * 터치 유도 문구(.intro__tap)는 디자인이 나오면 교체 예정.
 */
export function IntroPage() {
  const navigate = useNavigate()
  const { unlock } = useAudioPlayer()
  const [tapped, setTapped] = useState(!appConfig.requireTapToStart)

  useEffect(() => {
    if (!tapped) return
    const ms = appConfig.requireTapToStart ? appConfig.introAfterTapMs : appConfig.introDurationMs
    const t = setTimeout(() => navigate('/select', { replace: true }), ms)
    return () => clearTimeout(t)
  }, [tapped, navigate])

  const handleTap = () => {
    if (tapped) return
    // 새 방문자의 흐름이 시작되므로 이전 방문자의 선택 복원값을 지운다
    sessionStorage.removeItem(LAST_SELECTED_KEY)
    unlock()
    setTapped(true)
  }

  // iOS Safari는 touchstart(pointerdown)를 오디오 재생 허용 제스처로 인정하지 않으므로 click에서 잠금 해제
  return (
    <div className="page intro" onClick={handleTap}>
      <Header />
      <div className="page__body intro__body">
        <p className="intro__text">
          백그라운드에 재생되는
          <br />
          아티스트의 음악을 들어보고,
          <br />
          <strong>
            총 9개의 아티스트 중
            <br />
            가장 마음에 드는 아티스트
          </strong>
          를
          <br />
          선택해보세요!
        </p>

        {appConfig.requireTapToStart && !tapped && (
          <p className="intro__tap">화면을 터치하면 시작합니다</p>
        )}
      </div>
    </div>
  )
}
