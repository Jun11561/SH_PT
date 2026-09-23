import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

/**
 * 앱 전체에서 하나의 <audio> 를 공유하는 플레이어.
 * - unlock(): 사용자 터치 이벤트 안에서 호출해 모바일 자동재생 잠금을 해제
 * - play(src): 카드가 바뀔 때 해당 아티스트 곡을 재생 (이전 곡은 정지)
 * - stop(): 정지
 */
interface AudioPlayer {
  unlocked: boolean
  currentSrc: string | null
  unlock: () => void
  play: (src: string) => void
  stop: () => void
}

const AudioContext = createContext<AudioPlayer | null>(null)

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

  const getAudio = () => {
    if (!audioRef.current) {
      const a = new Audio()
      a.preload = 'auto'
      a.loop = true
      audioRef.current = a
    }
    return audioRef.current
  }

  const unlock = useCallback(() => {
    const a = getAudio()
    // 소스 없는 play()는 iOS에서 권한을 얻지 못하므로 짧은 무음 WAV를 한 번 재생해 둔다
    a.src = SILENT_WAV
    a.play()
      .catch(() => {})
      .finally(() => {
        a.pause()
        setUnlocked(true)
      })
  }, [])

  const play = useCallback((src: string) => {
    const a = getAudio()
    if (a.src.endsWith(src) && !a.paused) return
    a.src = src
    a.currentTime = 0
    setCurrentSrc(src)
    // 파일이 없거나 자동재생이 막힌 경우 조용히 무시
    a.play().catch(() => {})
  }, [])

  const stop = useCallback(() => {
    const a = getAudio()
    a.pause()
    setCurrentSrc(null)
  }, [])

  const value = useMemo(() => ({ unlocked, currentSrc, unlock, play, stop }), [unlocked, currentSrc, unlock, play, stop])
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudioPlayer() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudioPlayer must be used inside <AudioProvider>')
  return ctx
}
