import EventEmitter from 'eventemitter3';

import { Finger, FINGER_SCROLL_EVENT } from './Finger';
import { SCROLLBAR_SCROLL_EVENT } from './ScrollBar';
import { ScrollBarX } from './ScrollBarX';
import { ScrollBarY } from './ScrollBarY';
import { OFFSET_RECT_CHANGE_EVENT, POSITION_CHANGE_EVENT, Stage } from './Stage';
import { smooth } from './utils/smooth';
import { Wheel, WHEEL_SCROLL_EVENT } from './Wheel';

export const EVENT_SCROLL = 'scroll'

export interface ScrollEventPayload {
  x: number
  y: number
}

export interface ScrollPayload {
  deltaX: number
  deltaY: number
}

export interface ScrollerOptions {
  /**
   * speed rate by mouse wheel or touch pad
   */
  wheelScrollSpeedRatio?: number
  /**
   * speed rate by drag scrollbar
   */
  dragScrollSpeedRatio?: number
  /**
   * speed rate by swipe finger
   */
  fingerScrollSpeedRatio?: number
  /**
   * prevent original events (scroll, touch, etc)
   */
  preventDefault?: boolean
  /**
   * allowed scroll in horizon
   */
  allowScrollX?: boolean
  /**
   * allowed scroll in vertical
   */
  allowScrollY?: boolean
  /**
   * horizon scrollbar className
   */
  scrollBarClassNameX?: string
  /**
   * vertical scrollbar className
   */
  scrollBarClassNameY?: string
  /**
   * horizon scrollbar visible
   */
  scrollbarVisibleX?: boolean
  /**
   * vertical scrollbar visible
   */
  scrollbarVisibleY?: boolean
  /**
   * hidden scrollbar when inactive
   */
  hiddenInactiveScrollbar?: boolean
  /**
   * custom scroll smooth function
   */
  smoothFn?: typeof smooth
}

const defaultOptions = {
  wheelScrollSpeedRatio: 1,
  dragScrollSpeedRatio: 1,
  fingerScrollSpeedRatio: 1,
  preventDefault: true,
  allowScrollX: true,
  allowScrollY: true,
  scrollBarClassNameX: '',
  scrollBarClassNameY: '',
  scrollbarVisibleX: true,
  scrollbarVisibleY: true,
  hiddenInactiveScrollbar: true,
}

export class Scroller extends EventEmitter {
  public readonly scrollEl: HTMLElement
  public readonly wheel: Wheel
  public readonly finger: Finger
  public readonly stage: Stage
  public readonly scrollBarX: ScrollBarX
  public readonly scrollBarY: ScrollBarY
  private readonly options: ScrollerOptions

  constructor(scrollEl: HTMLElement, options: ScrollerOptions = {}) {
    super()
    this.scrollEl = scrollEl
    this.options = { ...defaultOptions, ...options }
    this.wheel = new Wheel(this.scrollEl, this.options)
    this.finger = new Finger(this.scrollEl, this.options)
    this.stage = new Stage(this.scrollEl, this.options)
    this.scrollBarX = new ScrollBarX(this.scrollEl, this.options)
    this.scrollBarY = new ScrollBarY(this.scrollEl, this.options)
    this.init()
  }

  public destroy() {
    this.wheel.destroy()
    this.finger.destroy()
    this.stage.destroy()
    this.scrollBarX.destroy()
    this.scrollBarY.destroy()
  }

  public update(maxX?: number, maxY?: number, minX?: number, minY?: number) {
    this.stage.update(maxX, maxY, minX, minY)
    this.sizeChange()
  }

  public setPosition(x: number, y: number, smooth = false) {
    return this.stage.setPosition(x, y, smooth)
  }

  public getPosition() {
    return this.stage.getPosition()
  }

  public setOffset(dx: number, dy: number, smooth = false) {
    return this.stage.setOffset(dx, dy, smooth)
  }

  private scroll = (payload: ScrollPayload) => {
    this.stage.setOffset(payload.deltaX, payload.deltaY)
    this.emit(EVENT_SCROLL, {
      x: this.stage.x,
      y: this.stage.y,
    } as ScrollEventPayload)
  }

  private init() {
    this.stage.init()
    this.wheel.init()
    this.finger.init(() => this.getPosition())
    this.wheel.on(WHEEL_SCROLL_EVENT, this.scroll)
    this.finger.on(FINGER_SCROLL_EVENT, this.scroll)
    this.stage.on(OFFSET_RECT_CHANGE_EVENT, this.sizeChange)
    this.stage.on(POSITION_CHANGE_EVENT, this.positionUpdate)
    this.scrollBarX.on(SCROLLBAR_SCROLL_EVENT, this.scroll)
    this.scrollBarY.on(SCROLLBAR_SCROLL_EVENT, this.scroll)
    this.sizeChange()
  }

  private sizeChange = () => {
    const stageRect = this.stage.getStageWidthAndHeight()
    this.scrollBarX.update(stageRect.width, stageRect.height)
    this.scrollBarY.update(stageRect.width, stageRect.height)
  }

  private positionUpdate = () => {
    this.scrollBarX.setPosition(
      (this.stage.x - this.stage.minX) / (this.stage.maxX - this.stage.minX),
    )
    this.scrollBarY.setPosition(
      (this.stage.y - this.stage.minY) / (this.stage.maxY - this.stage.minY),
    )
  }
}
