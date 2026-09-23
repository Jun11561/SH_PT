import { appConfig } from '../config/appConfig'
import { sumPlaytime } from '../data/artists'
import type { Artist } from '../data/types'
import { LogoMark } from './Logo'
import './Receipt.css'

/** 영수증 (대표곡 + 유사곡 4곡 = 5곡) */
export function Receipt({ artist }: { artist: Artist }) {
  const songs = [artist.mainSong, ...artist.similar]
  return (
    <div className="receipt">
      <div className="receipt__logo">
        <LogoMark size={44} />
      </div>

      <div className="receipt__meta">
        <span className="receipt__label">DATE</span>
        <span className="receipt__date">{appConfig.receiptDate}</span>
        <span className="receipt__brand">Wavelog</span>
      </div>

      <div className="receipt__head">
        <span>N.</span>
        <span>SONG</span>
        <span>ARTIST</span>
        <span>PLAYTIME</span>
      </div>

      <ol className="receipt__list">
        {songs.map((s, i) => (
          <li key={s.title + s.artist} className="receipt__row">
            <span>{String(i + 1).padStart(2, '0')}</span>
            <span className="receipt__song">{s.title}</span>
            <span className="receipt__artist">{s.artist}</span>
            <span>{s.playtime}</span>
          </li>
        ))}
      </ol>

      <div className="receipt__row receipt__row--total">
        <span>키워드</span>
        <span className="receipt__song">{artist.keywords}</span>
        <span className="receipt__artist">총</span>
        <span className="receipt__total">{sumPlaytime(songs)}</span>
      </div>

      <p className="receipt__footer">
        WAVELOG는 나의 음악 취향을 새로운 경험으로 이어주는 서비스입니다.
        <br />
        선택한 아티스트를 바탕으로 비슷한 아티스트와 곡을 담은 추천 리스트입니다.
        <br />
        추천곡을 감상하며 나와 잘 맞는 새로운 음악 취향을 발견해보세요.
      </p>
    </div>
  )
}
