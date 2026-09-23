export interface Song {
  title: string
  artist: string
  /** "03:20" 형식 */
  playtime: string
  /** 앨범 커버 이미지 경로 */
  cover: string
  /** 커버 이미지 안에 곡명/아티스트 글자가 이미 들어있으면 true (앱에서 글자를 겹쳐 그리지 않음) */
  coverHasText?: boolean
}

export interface Artist {
  /** URL, 파일명에 쓰는 영문 id */
  id: string
  /** 카드에 표시되는 이름 */
  name: string
  /** 공연 정보 (예: "DAY 1 · 126 스테이지") */
  stage: string
  /** 카드 하단 태그 3개 */
  tags: string[]
  /** 카드 하단 "재생중..." 문구용 짧은 표기 (없으면 name 사용) */
  shortName?: string
  /** 아티스트 사진 */
  photo: string
  /** 대표곡 */
  mainSong: Song
  /** 대표곡 음원 파일 (public/audio 기준) */
  audioSrc: string
  /** 유사곡 4곡 */
  similar: Song[]
  /** 영수증 키워드 (예: "여자 솔로 / 인디") */
  keywords: string
}
