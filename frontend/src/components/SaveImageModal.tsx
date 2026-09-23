import { useEffect, useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import type { Artist } from '../data/types'
import { Modal } from './Modal'
import { ResultContent } from './ResultContent'

interface Props {
  artist: Artist
  onClose: () => void
}

type Status = 'rendering' | 'ready' | 'error'

/*
 * 캡처 이미지에 넣을 폰트. html-to-image가 페이지의 Pretendard CSS를 통째로 임베드하면
 * 9개 굵기 × 2개 포맷이 base64로 들어가 130MB가 넘어 수십 초가 걸리고 iOS에선 멈춘다.
 * 결과 이미지에 쓰이는 굵기(400/600/700)의 woff2만 한 번 받아 재사용한다.
 */
const FONT_BASE = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2/'
const FONT_FILES: [number, string][] = [
  [400, 'Regular'],
  [600, 'SemiBold'],
  [700, 'Bold'],
]
let fontCssPromise: Promise<string> | null = null

/** 결과 화면 진입 시 미리 호출해 두면 저장 모달을 열 때 바로 캡처할 수 있다 */
export function preloadCaptureFonts() {
  if (!fontCssPromise) {
    fontCssPromise = buildFontCss().catch((e) => {
      fontCssPromise = null
      throw e
    })
  }
  return fontCssPromise
}

async function buildFontCss() {
  const faces = await Promise.all(
    FONT_FILES.map(async ([weight, name]) => {
      const res = await fetch(`${FONT_BASE}Pretendard-${name}.woff2`)
      if (!res.ok) throw new Error(`font ${name} ${res.status}`)
      const dataUrl = await blobToDataUrl(await res.blob())
      return `@font-face{font-family:Pretendard;font-weight:${weight};src:url(${dataUrl}) format('woff2')}`
    }),
  )
  return faces.join('')
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * 4-a. 내 결과를 사진으로 저장하기 모달
 * iOS Safari는 <a download>로 이미지를 저장하지 못하고, 공유 시트(→ "이미지 저장")는 탭 직후에만 열 수 있다.
 * 그래서 모달이 열릴 때 이미지를 미리 만들어 두고, 버튼을 누르면 곧바로 공유 시트를 띄운다(미지원 기기는 다운로드).
 */
export function SaveImageModal({ artist, onClose }: Props) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('rendering')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setStatus('rendering')
    const render = async () => {
      const node = captureRef.current
      if (!node) return
      await document.fonts.ready
      await Promise.all(
        Array.from(node.querySelectorAll('img')).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((r) => {
                img.addEventListener('load', r, { once: true })
                img.addEventListener('error', r, { once: true })
              }),
        ),
      )
      // 폰트를 못 받으면 기본 글꼴로라도 저장되도록 빈 값으로 진행
      const fontEmbedCSS = await preloadCaptureFonts().catch(() => '')
      const opts = { backgroundColor: '#ffffff', fontEmbedCSS }
      // Safari는 첫 캡처에서 이미지가 빠지는 경우가 있어 저해상도로 한 번 버리고 다시 캡처한다
      await toBlob(node, { ...opts, pixelRatio: 1 }).catch(() => null)
      const blob = await toBlob(node, { ...opts, pixelRatio: 3 })
      if (!blob) throw new Error('empty image')
      if (alive) {
        setFile(new File([blob], `wavelog_${artist.id}.png`, { type: 'image/png' }))
        setStatus('ready')
      }
    }
    render().catch((e) => {
      console.error('이미지 생성 실패', e)
      if (alive) setStatus('error')
    })
    return () => {
      alive = false
    }
  }, [artist.id, attempt])

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
      <div className="modal__preview" ref={captureRef}>
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
