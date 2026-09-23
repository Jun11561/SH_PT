/**
 * wavelog 로고. 디자이너의 정식 SVG를 받으면 이 파일의 svg 내용만 교체하면 됩니다.
 */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      // 화면 폭 비율에 맞춰 크기 조절 (size는 Figma 393px 기준 px)
      style={{ width: `calc(${size} * var(--u))`, height: 'auto' }}
      viewBox="0 0 40 28"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 2h8l7 24H9L2 2Z" fill="#111" />
      <path d="M14 2h8l7 24h-8L14 2Z" fill="#111" />
      <path d="M32.5 12.5c-3 0-5.5-2.2-5.5-5.2C27 4.5 30 2 32.5 2S38 4.5 38 7.3c0 3-2.5 5.2-5.5 5.2Z" fill="#3467e5" />
    </svg>
  )
}

export function Logo({ withText = true, size = 22 }: { withText?: boolean; size?: number }) {
  return (
    <span className="header__logo">
      <LogoMark size={size} />
      {withText && <span>wavelog</span>}
    </span>
  )
}
