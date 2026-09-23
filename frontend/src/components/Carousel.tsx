import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { appConfig } from '../config/appConfig'
import './Carousel.css'

interface Props {
  count: number
  index: number
  onChange: (next: number) => void
  renderItem: (i: number, active: boolean) => ReactNode
}

/** Figma 기준 카드 폭(393px 프레임). 간격·화살표 위치를 실제 카드 폭에 비례시켜 계산할 때 쓴다 */
const DESIGN_CARD_W = 259
/** 카드 사이 간격 (Figma 기준 px, 옆 카드 86% 축소분과 합쳐 시각적 간격 약 22px) */
const DESIGN_GAP = 4
/** 화살표 원 중심이 카드 가장자리에서 떨어진 거리 (Figma 기준 px) */
const DESIGN_ARROW_OFFSET = 29
/** 가운데 기준 좌우로 미리 그려둘 카드 수 (드래그 중 화면에 보일 수 있는 범위) */
const WINDOW = 2

const SWIPE_THRESHOLD = 40
const DRAG_START_PX = 6

const mod = (n: number, m: number) => ((n % m) + m) % m

/**
 * 가운데 카드가 활성, 양옆 카드가 살짝 보이는 무한 루프 캐러셀.
 * 끝없이 넘길 수 있도록 실제 인덱스 대신 "가상 위치(virt)"를 기준으로 가운데 주변 카드만 렌더링한다.
 * 좌우 화살표 + 옆 카드 탭 + (appConfig.enableSwipe 일 때) 손가락 스와이프 지원.
 */
export function Carousel({ count, index, onChange, renderItem }: Props) {
  const [virt, setVirt] = useState(index)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const draggingRef = useRef(false)
  const dragRef = useRef(0)
  const startX = useRef<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [cardW, setCardW] = useState(DESIGN_CARD_W)

  // 카드 폭은 CSS로 화면 비율에 맞춰 정해지므로 첫 페인트 전에 실측하고, 이후 크기 변화도 추적
  useLayoutEffect(() => {
    const slide = trackRef.current?.querySelector<HTMLElement>('.carousel__slide')
    if (!slide) return
    const update = () => {
      if (slide.offsetWidth) setCardW(slide.offsetWidth)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(slide)
    return () => ro.disconnect()
  }, [count])

  // 바깥에서 index가 바뀌면(예: 선택 복원) 가장 가까운 방향으로 가상 위치를 맞춘다
  useLayoutEffect(() => {
    if (mod(virt, count) === index) return
    let delta = mod(index - virt, count)
    if (delta > count / 2) delta -= count
    setVirt(virt + delta)
  }, [index, count, virt])

  const goTo = (pos: number) => {
    setVirt(pos)
    onChange(mod(pos, count))
  }
  const prev = () => goTo(virt - 1)
  const next = () => goTo(virt + 1)

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!appConfig.enableSwipe) return
    startX.current = e.clientX
  }
  // 포인터 이벤트가 연달아 올 때 리렌더 전의 state를 읽지 않도록 판단은 ref로 한다
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    // 탭은 캡처하지 않아야 옆 카드의 onClick이 동작한다. 일정 거리 이상 움직였을 때만 드래그로 전환
    if (!draggingRef.current) {
      if (Math.abs(dx) < DRAG_START_PX) return
      draggingRef.current = true
      setDragging(true)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        // 이미 끝난 포인터면 캡처 없이 진행
      }
    }
    dragRef.current = dx
    setDrag(dx)
  }
  const onPointerUp = () => {
    if (startX.current === null) return
    if (draggingRef.current) {
      if (dragRef.current < -SWIPE_THRESHOLD) next()
      else if (dragRef.current > SWIPE_THRESHOLD) prev()
    }
    startX.current = null
    draggingRef.current = false
    dragRef.current = 0
    setDragging(false)
    setDrag(0)
  }

  const scale = cardW / DESIGN_CARD_W
  const step = cardW + DESIGN_GAP * scale
  const arrowCenter = cardW / 2 + DESIGN_ARROW_OFFSET * scale

  const positions: number[] = []
  for (let p = virt - WINDOW; p <= virt + WINDOW; p++) positions.push(p)

  return (
    <div className="carousel">
      <div
        className={`carousel__viewport${dragging ? ' carousel__viewport--dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={trackRef} className="carousel__track">
          {positions.map((p) => {
            const i = mod(p, count)
            const active = p === virt
            return (
              // key를 가상 위치로 두어 같은 카드 요소가 유지된 채 위치만 애니메이션된다
              <div
                key={p}
                className={`carousel__slide${active ? ' carousel__slide--active' : ''}`}
                style={{
                  transform: `translateX(${(p - virt) * step + drag}px)`,
                  transition: dragging ? 'none' : undefined,
                }}
                onClick={() => !active && goTo(p)}
              >
                <div className="carousel__card">{renderItem(i, active)}</div>
              </div>
            )
          })}
        </div>
      </div>

      <button className="carousel__arrow" style={{ left: `calc(50% - ${arrowCenter}px)` }} aria-label="이전 아티스트" onClick={prev}>
        <ChevronIcon dir="left" />
      </button>
      <button className="carousel__arrow" style={{ left: `calc(50% + ${arrowCenter}px)` }} aria-label="다음 아티스트" onClick={next}>
        <ChevronIcon dir="right" />
      </button>
    </div>
  )
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ transform: dir === 'right' ? 'scaleX(-1)' : undefined }}>
      <path d="M7 1 1 7l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
