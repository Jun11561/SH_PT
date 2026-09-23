import type { Artist, Song } from './types'

/**
 * 아티스트 9팀 목업 데이터 (Figma 디자인 기준).
 * 백엔드 연동 후에는 src/api/client.ts 의 getArtists() 가 이 데이터 대신 서버 응답을 돌려줍니다.
 *
 * 이미지 위치: src/assets/artists/<id>/photo.jpg | album.jpg | sim1~4.jpg
 */
const img = (id: string, file: string) =>
  new URL(`../assets/artists/${id}/${file}`, import.meta.url).href

const song = (id: string, cover: string, title: string, artist: string, playtime: string): Song => ({
  title,
  artist,
  playtime,
  cover: img(id, cover),
})

const make = (
  id: string,
  name: string,
  tags: string[],
  mainTitle: string,
  mainPlaytime: string,
  keywords: string,
  similar: [string, string, string][],
  opts: { shortName?: string; mainArtistLabel?: string } = {},
): Artist => ({
  id,
  name,
  shortName: opts.shortName,
  stage: 'DAY 1 · 126 스테이지',
  tags,
  photo: img(id, 'photo.jpg'),
  // 현재 album.jpg 는 Figma에서 가져온 이미지라 곡명/아티스트 글자가 포함되어 있음.
  // 원본 앨범아트로 교체하면 coverHasText 를 false 로 바꾸면 됨 (앱이 글자를 직접 그림)
  mainSong: { ...song(id, 'album.jpg', mainTitle, opts.mainArtistLabel ?? name, mainPlaytime), coverHasText: true },
  audioSrc: `/audio/${id}.mp3`,
  similar: similar.map(([t, a, p], i) => song(id, `sim${i + 1}.jpg`, t, a, p)),
  keywords,
})

export const artists: Artist[] = [
  make('yoonmarch', '윤마치 (MRCH)', ['청량', '인디', '여성솔로'], 'Color It', '03:20', '여자 솔로 / 인디', [
    ['미친건가', '주혜린', '03:22'],
    ['금붕어', '한로로', '03:32'],
    ['곰팡이', '공원', '03:29'],
    ['클라우드 쿠쿠랜드', '정우', '03:36'],
  ], { shortName: '윤마치' }),

  make('touched', '터치드', ['강렬', '밴드', '하드사운드'], 'Alive', '03:32', '강한 사운드 / 밴드', [
    ['Bad Sniper', '터치드', '03:34'],
    ['Player 1', 'KARDI (카디)', '03:39'],
    ['Rush', '더 픽스', '03:31'],
    ['먹이사슬', '한로로', '03:22'],
  ]),

  make('owol', '오월오일', ['청량', '밴드', '초여름'], 'Lunch Time', '03:17', '초여름 / 동화st', [
    ['슈슈', '신인류', '04:10'],
    ['New Hippie Generation', '페퍼톤스', '03:44'],
    ['아멜리아', '포터블 구르브 나인', '04:12'],
    ['눈이 마주쳤을때', 'O.O.O', '03:17'],
  ], { mainArtistLabel: '오월오일 ( 五月五日 )' }),

  make('atlus', 'ATLUS sound team', ['인트로', '재즈', '느좋'], 'Color Your Night', '03:47', '인트로느좋 / 얼터너티브', [
    ['COMPLEX', '고고학', '05:11'],
    ['GOGO', '심아일랜드', '03:42'],
    ['GOSU', '라쿠네라마', '02:49'],
    ['Ghosts are bored', '87DANCE', '01:12'],
  ], { shortName: 'ATLUS', mainArtistLabel: 'ATLUS Sound Team' }),

  make('leedoor', '리도어', ['몽환', '밴드', '서정적인'], '영원은 그렇듯', '03:58', '서정적인 / 몽환적인', [
    ['춤을 춰요', '라쿠나', '04:20'],
    ['열기구', 'SURL (설)', '03:59'],
    ['Ride', 'wave to earth', '03:48'],
    ['LOBSTER KING', 'Tuesday Beach Club', '03:17'],
  ]),

  make('oneokrock', 'ONE OK ROCK', ['밴드', '달리자', '락사운드'], '完全感覚Dreamer', '04:12', '달리는 / 락 사운드', [
    ['Get Your Gun', '브로큰발렌타인', '03:37'],
    ['비켜ㅕㅕㅕ', 'Snake Chicken Soup', '04:31'],
    ['집 (feat. 유미)', '극동아시아타이거즈', '03:28'],
    ['혁명의 연인들', '전기뱀장어', '03:45'],
  ]),

  make('juhyerin', '주혜린', ['하우스', '전자음악', '감도높은'], 'BUSY BOY', '03:15', '하우스 풍 / 고감도', [
    ['Hit the Bang', '라쿠네라마', '04:55'],
    ['HEADLOCK', 'Luci Gang', '01:59'],
    ['집 (feat. 유미)', '하우즈룰즈', '04:05'],
    ['Intro(Absolute)', '롤러코스터', '01:12'],
  ]),

  make('87dance', '87DANCE', ['리듬감', '밴드', '박자감'], 'Beautiful Complex', '03:42', '구르브한 / 박자감있는', [
    ['Skunk (feat. Cory Wong)', 'Bump2Soul', '04:26'],
    ['의심스러워', '술탄오브더디스코', '03:35'],
    ['곱슬머리', '잭킹콩', '03:22'],
    ['WHAT TIME IS IT NOW?', 'SURL (설)', '03:35'],
  ], { shortName: '87댄스' }),

  make('yb', 'YB', ['하드사운드', '인디', '솔로'], 'Rebellion (feat. Xdinary Heroes)', '03:45', '하드 / 강한 / 난해한', [
    ['iNSTEAD!', 'Xdinary Heroes', '02:57'],
    ['울트라맨이야', '서태지', '03:25'],
    ['Drown', 'Bring Me The Horizon', '03:42'],
    ['Killing In the Name', 'Rage Against The Machine', '05:13'],
  ]),
]

export const findArtist = (id: string | undefined) => artists.find((a) => a.id === id)

/** "03:20" 형식 문자열들의 합계를 "17:19" 형식으로 */
export const sumPlaytime = (songs: Song[]) => {
  const total = songs.reduce((acc, s) => {
    const [m, sec] = s.playtime.split(':').map(Number)
    return acc + m * 60 + sec
  }, 0)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
