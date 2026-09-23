/**
 * 백엔드 연동 지점.
 * 지금은 appConfig.useMock=true 로 목업 데이터를 돌려주며,
 * 백엔드가 준비되면 useMock=false 로 바꾸고 아래 fetch 구현만 서버 스펙에 맞춰 수정하면 됩니다.
 */
import { appConfig } from '../config/appConfig'
import { artists as mockArtists } from '../data/artists'
import type { Artist } from '../data/types'

const base = appConfig.apiBaseUrl

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

/** 아티스트 9팀 + 유사곡 목록 */
export async function getArtists(): Promise<Artist[]> {
  if (appConfig.useMock) return mockArtists
  return http<Artist[]>('/api/artists')
}

export interface PrintRequest {
  artistId: string
  /** 영수증에 찍히는 곡 목록 (대표곡 + 유사곡) */
  songs: { title: string; artist: string; playtime: string }[]
  keywords: string
  totalPlaytime: string
}

/** 포토프린터 출력 요청. 완료되면 resolve, 실패하면 reject */
export async function requestPrint(payload: PrintRequest): Promise<void> {
  if (appConfig.useMock) {
    await wait(appConfig.mockPrintDelayMs)
    return
  }
  await http<unknown>('/api/print', { method: 'POST', body: JSON.stringify(payload) })
}

/** 결과 저장(서버 기록용). 현재 프론트는 이미지 다운로드만 처리하므로 선택적으로 사용 */
export async function saveResult(payload: PrintRequest): Promise<void> {
  if (appConfig.useMock) return
  await http<unknown>('/api/results', { method: 'POST', body: JSON.stringify(payload) })
}
