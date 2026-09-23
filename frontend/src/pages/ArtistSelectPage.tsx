import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArtistCard } from '../components/ArtistCard'
import { Carousel } from '../components/Carousel'
import { Header } from '../components/Header'
import { useArtists } from '../hooks/useArtists'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import './ArtistSelectPage.css'

export const LAST_SELECTED_KEY = 'sh_pt_last_selected_artist_id'

function findSavedIndex(artists: { id: string }[]) {
  const savedId = sessionStorage.getItem(LAST_SELECTED_KEY)
  if (!savedId) return 0
  return Math.max(0, artists.findIndex((a) => a.id === savedId))
}

/**
 * 2. 아티스트 추천 화면
 * 카드가 바뀔 때마다 해당 아티스트 대표곡을 자동재생합니다.
 */
export function ArtistSelectPage() {
  const navigate = useNavigate()
  const { artists, loading } = useArtists()
  const { play, stop } = useAudioPlayer()
  // 결과 화면에서 돌아왔을 때 마지막 선택 카드를 복원. 목록이 캐시돼 있으면 첫 렌더부터 복원해
  // 0번 곡이 잠깐 재생되거나 0번에서 슬라이드되는 현상을 막는다.
  const [index, setIndex] = useState(() => findSavedIndex(artists))
  const restored = useRef(artists.length > 0)

  const current = artists[index]

  // 목록이 처음 로드되는 경우(캐시 없음)에는 로드 직후 복원
  useEffect(() => {
    if (restored.current || artists.length === 0) return
    restored.current = true
    setIndex(findSavedIndex(artists))
  }, [artists])

  useEffect(() => {
    if (current) play(current.audioSrc)
  }, [current, play])

  // 화면을 떠나면 정지
  useEffect(() => () => stop(), [stop])

  const select = () => {
    if (!current) return
    sessionStorage.setItem(LAST_SELECTED_KEY, current.id)
    navigate(`/result/${current.id}`)
  }

  return (
    <div className="page select">
      <Header />
      <div className="page__body select__body">
        <h1 className="title-xl text-center select__title">
          마음에 드는 아티스트를
          <br />
          선택해보세요!
        </h1>

        {loading || artists.length === 0 ? (
          <p className="select__loading">불러오는 중...</p>
        ) : (
          <Carousel
            count={artists.length}
            index={index}
            onChange={setIndex}
            renderItem={(i, active) => <ArtistCard artist={artists[i]} active={active} />}
          />
        )}

        <div className="select__cta">
          <button className="btn btn--black btn--block" onClick={select} disabled={!current}>
            선택하기
          </button>
        </div>
      </div>
    </div>
  )
}
