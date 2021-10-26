const DURATION_FRAME = 12

export interface SmoothData {
  fromX: number
  fromY: number
  toX: number
  toY: number
  nowX?: number
  nowY?: number
  frameCount?: number
}

export function smooth(data: SmoothData) {
  const { fromX, fromY, toX, toY } = data
  const nowX = data.nowX || fromX
  const nowY = data.nowY || fromY
  const frameCount = data.frameCount || 0

  let nextX
  let nextY

  if (frameCount >= DURATION_FRAME) {
    return
  }

  if (frameCount === DURATION_FRAME - 1) {
    nextX = toX
    nextY = toY
  } else {
    nextX = nowX + (toX - fromX) / DURATION_FRAME
    nextY = nowY + (toY - fromY) / DURATION_FRAME
  }

  return {
    fromX,
    fromY,
    toX,
    toY,
    nowX: nextX,
    nowY: nextY,
    frameCount: frameCount + 1,
  }
}
