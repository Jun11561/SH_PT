import { useEffect, useState } from 'react'
import type { Artist } from '../data/types'
import { Modal } from './Modal'
import { ResultContent } from './ResultContent'
import { renderResultImage } from './resultImage'

interface Props {
  artist: Artist
  onClose: () => void
}

type Status = 'rendering' | 'ready' | 'error'

/**
 * 4-a. 내 결과를 사진으로 저장하기 모달
 * iOS Safari는 <a download>로 이미지를 저장하지 못하고, 공유 시트(→ "이미지 저장")는 탭 직후에만 열 수 있다.
 * 그래서 모달이 열릴 때 이미지를 미리 만들어 두고, 버튼을 누르면 곧바로 공유 시트를 띄운다(미지원 기기는 다운로드).
 */
export function SaveImageModal({ artist, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('rendering')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setStatus('rendering')
    renderResultImage(artist)
      .then((blob) => {
        if (!alive) return
        setFile(new File([blob], `wavelog_${artist.id}.png`, { type: 'image/png' }))
        setStatus('ready')
      })
      .catch((e) => {
        console.error('이미지 생성 실패', e)
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [artist, attempt])

  const save = async () => {
    if (status === 'error') {
      setAttempt((n) => n + 1)
      return
    }
    if (!file) return
    // PC(Windows/Mac) 크롬도 파일 공유를 지원한다고 응답하지만 공유 창이 보이지 않거나 불편하므로, 모바일에서만 공유 시트를 쓴다
    if (isMobileDevice() && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch (e) {
        // 사용자가 공유 시트를 닫은 경우는 그대로 종료
        if ((e as Error).name === 'AbortError') return
      }
    }
    download(file)
  }

  const label = status === 'rendering' ? '이미지 준비 중...' : status === 'error' ? '다시 시도' : '결과 저장하기'

  return (
    <Modal title="내 결과를 사진으로 저장하기" onClose={onClose}>
      <div className="modal__preview">
        <ResultContent artist={artist} compact />
      </div>
      <div className="modal__actions">
        <button className="btn btn--primary btn--block" onClick={save} disabled={status === 'rendering'}>
          {label}
        </button>
      </div>
    </Modal>
  )
}

function isMobileDevice() {
  const ua = navigator.userAgent
  // iPadOS는 데스크톱 Safari UA(Macintosh)를 쓰므로 터치 지원 여부로 구분
  return /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

function download(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
