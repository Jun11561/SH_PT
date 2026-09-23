import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { PrintRequest } from '../api/client'
import { Header } from '../components/Header'
import { ReceiptModal } from '../components/ReceiptModal'
import { ResultContent } from '../components/ResultContent'
import { SaveImageModal } from '../components/SaveImageModal'
import { sumPlaytime } from '../data/artists'
import { useArtists } from '../hooks/useArtists'
import './ResultPage.css'

type ModalKind = 'none' | 'save' | 'receipt'

/**
 * 3. 결과 화면 (공연상세)
 * - 결과 저장하기 → 사진 저장 모달
 * - 결과 출력하기 → 영수증 모달 → 출력 요청 → 출력중 화면
 */
export function ResultPage() {
  const { artistId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { artists, loading } = useArtists()
  const [modal, setModal] = useState<ModalKind>('none')

  const artist = artists.find((a) => a.id === artistId)

  if (loading) return <div className="page" />
  if (!artist) return <Navigate to="/select" replace />

  const buildPayload = (): PrintRequest => {
    const songs = [artist.mainSong, ...artist.similar]
    return {
      artistId: artist.id,
      songs: songs.map(({ title, artist: a, playtime }) => ({ title, artist: a, playtime })),
      keywords: artist.keywords,
      totalPlaytime: sumPlaytime(songs),
    }
  }

  const print = () => {
    setModal('none')
    // 출력 요청은 출력중 화면에서 진행 상태를 보여주며 수행
    navigate('/printing', { state: { payload: buildPayload() } })
  }

  return (
    <div className="page page--decor result-page">
      <Header
        logo={false}
        back
        // 앱 안에서 들어왔으면 히스토리를 되돌리고(중복 항목 방지), 주소로 바로 들어왔으면 선택 화면으로 교체
        onBack={() => (location.key === 'default' ? navigate('/select', { replace: true }) : navigate(-1))}
      />
      <div className="page__body">
        <ResultContent artist={artist} />
      </div>

      <div className="result-page__actions">
        <button className="btn btn--outline" onClick={() => setModal('save')}>
          결과 저장하기
        </button>
        <button className="btn btn--primary" onClick={() => setModal('receipt')}>
          결과 출력하기
        </button>
      </div>

      {modal === 'save' && <SaveImageModal artist={artist} onClose={() => setModal('none')} />}
      {modal === 'receipt' && <ReceiptModal artist={artist} onClose={() => setModal('none')} onPrint={print} />}
    </div>
  )
}
