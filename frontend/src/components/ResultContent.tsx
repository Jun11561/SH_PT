import type { Artist } from '../data/types'
import './ResultContent.css'

interface Props {
  artist: Artist
  /** 사진 저장 모달 안의 축소 미리보기용 */
  compact?: boolean
}

/**
 * "내가 선택한 아티스트 및 곡과 유사한 곡 리스트" 본문.
 * 결과 화면과 사진 저장 모달(미리보기/이미지 캡처)에서 같이 사용합니다.
 */
export function ResultContent({ artist, compact = false }: Props) {
  return (
    <div className={`result${compact ? ' result--compact' : ''}`}>
      <h1 className="title-xl result__title">
        내가 선택한 아티스트 및 곡과
        <br />
        <span className="accent">유사한 곡 리스트</span>에요
      </h1>

      <div className="result__hero">
        <div className="result__photo">
          <img src={artist.photo} alt={artist.name} crossOrigin="anonymous" />
        </div>
        <div className="result__album">
          <img src={artist.mainSong.cover} alt={artist.mainSong.title} crossOrigin="anonymous" />
          {!artist.mainSong.coverHasText && (
            <div className="result__album-caption">
              <strong>{artist.mainSong.title}</strong>
              <span>{artist.mainSong.artist}</span>
            </div>
          )}
        </div>
      </div>

      <ul className="result__songs">
        {artist.similar.map((s) => (
          <li key={s.title + s.artist} className="song-row">
            <img className="song-row__cover" src={s.cover} alt="" crossOrigin="anonymous" />
            <div className="song-row__text">
              <strong className="song-row__title">{s.title}</strong>
              <span className="song-row__artist">{s.artist}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
