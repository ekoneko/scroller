import EventEmitter from 'eventemitter3';

import { ScrollerOptions, ScrollPayload } from '.';

export const WHEEL_SCROLL_EVENT = 'WHEEL_SCROLL_EVENT'

export class Wheel extends EventEmitter {
  private scrollEl: HTMLElement
  private options: ScrollerOptions
  constructor(scrollEl: HTMLElement, options: ScrollerOptions) {
    super()
    this.scrollEl = scrollEl
    this.options = options
  }

  public init() {
    this.scrollEl.addEventListener('wheel', this.handleWheel)
  }

  public destroy() {
    this.scrollEl.removeEventListener('wheel', this.handleWheel)
  }

  /**
   * Translate delta unit to pixels
   * @see: https://developer.mozilla.org/en-US/docs/Web/Events/wheel
   */
  private translateDeltaToPixel(event: WheelEvent) {
    if (event.deltaMode === (event.DOM_DELTA_LINE || 1)) {
      return {
        deltaX: event.deltaX * 16,
        deltaY: event.deltaY * 16,
      }
    }
    return {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
    }
  }

  private handleWheel = (event: WheelEvent) => {
    /**
     * Pinch on osx touch pad will detect wheel event with ctrlKey = 1.
     */
    if (event.ctrlKey || event.metaKey) {
      return
    }
    if (this.options.preventDefault !== false) {
      /**
       * Prevent touch pad detect goBack or goNext
       */
      event.preventDefault()
    }
    const { deltaX: originDeltaX, deltaY: originDeltaY } = this.translateDeltaToPixel(event)
    let deltaX = this.options.allowScrollX ? originDeltaX : 0
    let deltaY = this.options.allowScrollY ? originDeltaY : 0
    /**
     * Wheel with press shift
     */
    if (this.options.allowScrollX && event.shiftKey && originDeltaX === 0 && originDeltaY !== 0) {
      deltaX = originDeltaY
      deltaY = 0
    }
    /**
     * Don't allow scroll horizon and vertical at same time.
     */
    const horizonMode = Math.abs(deltaX) > Math.abs(deltaY)
    const { wheelScrollSpeedRatio = 1 } = this.options
    this.emit(WHEEL_SCROLL_EVENT, {
      deltaX: horizonMode ? deltaX * wheelScrollSpeedRatio : 0,
      deltaY: horizonMode ? 0 : deltaY * wheelScrollSpeedRatio,
    } as ScrollPayload)
  }
}
