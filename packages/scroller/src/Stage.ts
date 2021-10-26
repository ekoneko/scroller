import EventEmitter from 'eventemitter3';

import { ScrollerOptions } from '.';
import { requestAnimationFrame } from './utils/animate';
import { addStyle, createElement } from './utils/dom';
import { smooth, SmoothData } from './utils/smooth';

export const OFFSET_RECT_CHANGE_EVENT = 'OFFSET_RECT_CHANGE_EVENT'
export const POSITION_CHANGE_EVENT = 'POSITION_CHANGE_EVENT'

export class Stage extends EventEmitter {
  public x: number
  public y: number
  public maxX: number
  public maxY: number
  public minX: number
  public minY: number
  private readonly scrollEl: HTMLElement
  private wrapperEl: HTMLElement
  private stageEl: HTMLElement
  private options: ScrollerOptions
  private currentAnimateId: number
  private smoothFn: typeof smooth
  private animateUUID = 0

  public constructor(scrollEl: HTMLElement, options: ScrollerOptions) {
    super()
    this.scrollEl = scrollEl
    this.options = options
    this.smoothFn = this.options.smoothFn || smooth
  }

  public init() {
    if (!this.stageEl) {
      this.createStageEl()
    }
    this.x = this.scrollEl.scrollLeft
    this.y = this.scrollEl.scrollTop
    addStyle(this.scrollEl, {
      overflow: 'visible',
      position: 'relative',
      width: '100%',
      height: '100%',
    })
    this.update()
  }

  public setPosition(x: number, y: number, smooth = false) {
    const { x: safeX, y: safeY } = this.getSafePosition(x, y)

    if (smooth) {
      this.currentAnimateId = this.animateUUID++
      const smoothData = this.smoothFn({
        fromX: this.x,
        fromY: this.y,
        toX: safeX,
        toY: safeY,
      })
      smoothData && this.setPositionSmooth(smoothData, this.currentAnimateId)
      return
    }
    this.currentAnimateId = -1
    if (this.x !== safeX || this.y !== safeY) {
      this.x = safeX
      this.y = safeY
      this.renderPosition(this.x, this.y)
    }
  }

  public getPosition() {
    return {
      x: this.x,
      y: this.y,
    }
  }

  public setOffset(deltaX: number, deltaY: number, smooth = false) {
    this.setPosition(this.x + deltaX, this.y + deltaY, smooth)
  }

  public getStageWidthAndHeight() {
    return {
      width: this.stageEl.offsetWidth,
      height: this.stageEl.offsetHeight,
    }
  }

  public destroy() {
    const children = this.stageEl.children
    for (let i = 0; i < children.length; i++) {
      this.scrollEl.insertBefore(children[i], this.wrapperEl)
    }
    this.wrapperEl.remove()
  }

  public update(maxX?: number, maxY?: number, minX?: number, minY?: number) {
    this.maxX = maxX || this.stageEl.clientWidth - this.scrollEl.clientWidth
    this.maxY = maxY || this.stageEl.clientHeight - this.scrollEl.clientHeight
    this.minX = minX || 0
    this.minY = minY || 0

    const { x: safeX, y: safeY } = this.getSafePosition(this.x, this.y)
    if (this.x !== safeX || this.y !== safeY) {
      this.x = safeX
      this.y = safeY
      this.renderPosition(this.x, this.y)
    }
  }

  private getSafePosition(x: number, y: number) {
    return {
      x: Math.min(Math.max(this.minX, x), this.maxX),
      y: Math.min(Math.max(this.minY, y), this.maxY),
    }
  }

  private createStageEl() {
    const boundingRect = this.scrollEl.getBoundingClientRect()
    this.wrapperEl = createElement(
      'div',
      { dataTest: 'stage' },
      {
        position: 'absolute',
        overflow: 'hidden',
        width: `${boundingRect.width}px`,
        height: `${boundingRect.height}px`,
      },
    )
    this.stageEl = createElement(
      'div',
      {},
      {
        position: 'absolute',
        minWidth: '100%',
        minHeight: '100%',
      },
    )
    const children = this.scrollEl.children
    this.scrollEl.appendChild(this.wrapperEl)
    this.wrapperEl.appendChild(this.stageEl)
    for (let i = 0; i < children.length; i++) {
      this.stageEl.appendChild(children.item(i) as HTMLElement)
    }
    this.wrapperEl.addEventListener('scroll', () => this.antiOriginScroll())
  }

  /**
   * Some behaviors may case original scroll offset
   * e.g: focus an input element outside viewport
   */
  private antiOriginScroll = () => {
    this.wrapperEl.scrollTop = 0
    this.wrapperEl.scrollLeft = 0
  }

  private setPositionSmooth(data: Required<SmoothData>, animateId: number) {
    if (animateId !== this.currentAnimateId) {
      return
    }
    this.x = data.nowX
    this.y = data.nowY
    this.renderPosition(this.x, this.y)
    const nextData = this.smoothFn(data)
    nextData &&
      requestAnimationFrame.call(window, () => this.setPositionSmooth(nextData, animateId))
  }

  private renderPosition(x: number, y: number) {
    addStyle(this.stageEl, {
      transform: `translate(${-x}px, ${-y}px)`,
    })
    this.emit(POSITION_CHANGE_EVENT)
  }
}
