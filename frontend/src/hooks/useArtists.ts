import { useEffect, useState } from 'react'
import { getArtists } from '../api/client'
import type { Artist } from '../data/types'

let cache: Artist[] | null = null

/** 아티스트 목록을 한 번만 불러와 캐시합니다. */
export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>(cache ?? [])
  const [loading, setLoading] = useState(cache === null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (cache) return
    let alive = true
    getArtists()
      .then((list) => {
        cache = list
        if (alive) setArtists(list)
      })
      .catch((e: Error) => alive && setError(e))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return { artists, loading, error }
}
