import type { Artist } from '../data/types'
import './ArtistCard.css'

interface Props {
  artist: Artist
  /** 가운데(활성) 카드 여부 */
  active?: boolean
}

export function ArtistCard({ artist, active = false }: Props) {
  const label = artist.shortName ?? artist.name
  // 카드 폭이 좁아 한 줄에 안 들어가므로 "재생중" 문구에서는 피처링 표기를 뺀다
  const songTitle = artist.mainSong.title.replace(/\s*\(feat\..*?\)/i, '')
  return (
    <article className={`artist-card${active ? ' artist-card--active' : ''}`}>
      <div className="artist-card__photo">
        <img src={artist.photo} alt={artist.name} draggable={false} />
      </div>
      <div className="artist-card__body">
        <h3 className="artist-card__name">{artist.name}</h3>
        <p className="artist-card__stage">{artist.stage}</p>
        <div className="artist-card__divider" />
        <ul className="artist-card__tags">
          {artist.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="artist-card__now">
          {label} - {songTitle} 재생중...
        </p>
      </div>
    </article>
  )
}
