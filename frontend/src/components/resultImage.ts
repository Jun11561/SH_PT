import type { Artist } from '../data/types'

/*
 * "사진으로 저장" 결과 이미지를 캔버스에 직접 그린다.
 * DOM 캡처(html-to-image)는 iOS Safari에서 큰 이미지가 빠진 채 캡처되는 문제가 있어,
 * 모달 미리보기(.result--compact, 393px 화면 기준 폭 300px)와 같은 레이아웃을 좌표로 그린다.
 * 아래 수치는 모두 CSS px 기준이며 SCALE배로 그린다.
 */
const SCALE = 3
const W = 300
const PAD_X = 14
const PAD_TOP = 18
const PAD_BOTTOM = 14
const FONT = 'Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif'

const TITLE_SIZE = 15
const TITLE_LH = TITLE_SIZE * 1.45
const TITLE_MB = 12
const HERO_GAP = 6
const TILE_W = (W - PAD_X * 2 - HERO_GAP) / 2
const TILE_H = (TILE_W * 180) / 176
const TILE_R = 8
const SONGS_MT = 14
const ROW_H = 44
const ROW_GAP = 8
const ROW_R = 10
const COVER_W = 46

const COLOR_TEXT = '#181818'
const COLOR_SUB = '#6b7280'
const COLOR_ACCENT = '#3467e5'

export async function renderResultImage(artist: Artist): Promise<Blob> {
  const height =
    PAD_TOP + TITLE_LH * 2 + TITLE_MB + TILE_H + SONGS_MT + artist.similar.length * ROW_H + (artist.similar.length - 1) * ROW_GAP + PAD_BOTTOM

  await Promise.all(
    ['700 15px', '600 11px', '400 9px', '700 18px', '400 12px'].map((f) => document.fonts.load(`${f} Pretendard`).catch(() => [])),
  )
  // 이미지 하나를 못 불러와도 저장 자체는 되도록, 실패한 칸은 회색으로만 그린다
  const [photo, album, ...covers] = await Promise.all(
    [artist.photo, artist.mainSong.cover, ...artist.similar.map((s) => s.cover)].map((src) => loadImage(src).catch(() => null)),
  )

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(W * SCALE)
  canvas.height = Math.round(height * SCALE)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d unavailable')
  ctx.scale(SCALE, SCALE)
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, height)

  // 제목: "내가 선택한 아티스트 및 곡과" / "유사한 곡 리스트(파랑)에요"
  let y = PAD_TOP
  setFont(ctx, 700, TITLE_SIZE, -0.02)
  ctx.fillStyle = COLOR_TEXT
  ctx.fillText('내가 선택한 아티스트 및 곡과', PAD_X, y + TITLE_LH / 2)
  y += TITLE_LH
  ctx.fillStyle = COLOR_ACCENT
  const accent = '유사한 곡 리스트'
  ctx.fillText(accent, PAD_X, y + TITLE_LH / 2)
  ctx.fillStyle = COLOR_TEXT
  ctx.fillText('에요', PAD_X + ctx.measureText(accent).width, y + TITLE_LH / 2)
  y += TITLE_LH + TITLE_MB

  // 아티스트 사진 + 대표곡 앨범
  drawCover(ctx, photo, PAD_X, y, TILE_W, TILE_H, TILE_R)
  const albumX = PAD_X + TILE_W + HERO_GAP
  drawCover(ctx, album, albumX, y, TILE_W, TILE_H, TILE_R)
  if (!artist.mainSong.coverHasText) {
    ctx.save()
    roundRect(ctx, albumX, y, TILE_W, TILE_H, TILE_R)
    ctx.clip()
    const grad = ctx.createLinearGradient(0, y, 0, y + TILE_H)
    grad.addColorStop(0.3, 'rgba(0,0,0,0.05)')
    grad.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = grad
    ctx.fillRect(albumX, y, TILE_W, TILE_H)
    ctx.restore()
    const inner = TILE_W - 24
    ctx.fillStyle = '#fff'
    setFont(ctx, 400, 12)
    ctx.globalAlpha = 0.9
    const artistY = y + TILE_H - 12 - 7.5
    ctx.fillText(ellipsis(ctx, artist.mainSong.artist, inner), albumX + 12, artistY)
    ctx.globalAlpha = 1
    setFont(ctx, 700, 18)
    ctx.fillText(ellipsis(ctx, artist.mainSong.title, inner), albumX + 12, artistY - 7.5 - 10.8)
  }
  y += TILE_H + SONGS_MT

  // 유사곡 목록
  artist.similar.forEach((song, i) => {
    const x = PAD_X
    const w = W - PAD_X * 2
    ctx.save()
    roundRect(ctx, x, y, w, ROW_H, ROW_R)
    ctx.fillStyle = '#f8f8fa'
    ctx.fill()
    ctx.clip()
    drawImageCover(ctx, covers[i], x, y, COVER_W, ROW_H)
    ctx.restore()
    ctx.save()
    roundRect(ctx, x + 0.5, y + 0.5, w - 1, ROW_H - 1, ROW_R)
    ctx.strokeStyle = '#efeff0'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    const textX = x + COVER_W + 14
    const textW = w - COVER_W - 28
    const mid = y + ROW_H / 2
    ctx.fillStyle = COLOR_TEXT
    setFont(ctx, 600, 11, -0.01)
    ctx.fillText(ellipsis(ctx, song.title, textW), textX, mid - 5.9)
    ctx.fillStyle = COLOR_SUB
    setFont(ctx, 400, 9)
    ctx.fillText(ellipsis(ctx, song.artist, textW), textX, mid + 7)
    y += ROW_H + ROW_GAP
  })

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  )
}

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number, letterSpacingEm = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`
  // letterSpacing은 지원 브라우저에서만 적용(미지원이면 무시)
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacingEm * size}px`
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image load failed: ${src}`))
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** object-fit: cover 처럼 잘라 그린다 */
function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, h: number) {
  if (!img) {
    ctx.fillStyle = '#eee'
    ctx.fillRect(x, y, w, h)
    return
  }
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = w / scale
  const sh = h / scale
  const sx = (img.naturalWidth - sw) / 2
  const sy = (img.naturalHeight - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, h: number, r: number) {
  ctx.save()
  roundRect(ctx, x, y, w, h, r)
  ctx.fillStyle = '#eee'
  ctx.fill()
  ctx.clip()
  drawImageCover(ctx, img, x, y, w, h)
  ctx.restore()
}

function ellipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t}…`
}
