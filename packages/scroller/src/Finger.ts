import EventEmitter from 'eventemitter3';

import { ScrollerOptions, ScrollPayload } from '.';
import { requestAnimationFrame } from './utils/animate';

export const FINGER_SCROLL_EVENT = 'FINGER_SCROLL_EVENT'
const SNAPSHOT_LENGTH = 5

enum DIRECTION {
  Horizon = 'Horizon',
  Vertical = 'Vertical',
}

interface TouchSnapshot {
  deltaX: number
  deltaY: number
  timestamp: number
  direction: DIRECTION
}

export class Finger extends EventEmitter {
  private scrollEl: HTMLElement
  private options: ScrollerOptions
  private touching: boolean
  /**
   * Flag inertial scroll (scrolling after fingers leave touch pad)
   * New finger event will abort last inertial scroll
   */
  private inertial: boolean
  /**
   * Snapshot last few frames scroll distances
   * for computing inertial scroll speed.
   */
  private touchSnapshotList: TouchSnapshot[] = []
  private touchPosX: number
  private touchPosY: number
  private getPosition: () => { x: number; y: number }

  constructor(scrollEl: HTMLElement, options: ScrollerOptions) {
    super()
    this.scrollEl = scrollEl
    this.options = options
  }

  public init(getPosition: () => { x: number; y: number }) {
    this.scrollEl.addEventListener('touchstart', this.handleTouchStart)
    this.scrollEl.addEventListener('touchmove', this.handleTouchMove)
    this.scrollEl.addEventListener('touchend', this.handleTouchEnd)
    this.scrollEl.addEventListener('touchcancel', this.handleTouchCancel)
    this.getPosition = getPosition
  }

  public destroy() {
    this.scrollEl.removeEventListener('touchstart', this.handleTouchStart)
    this.scrollEl.removeEventListener('touchmove', this.handleTouchMove)
    this.scrollEl.removeEventListener('touchend', this.handleTouchEnd)
    this.scrollEl.removeEventListener('touchcancel', this.handleTouchCancel)
  }

  private handleTouchStart = (event: TouchEvent) => {
    if (this.inertial) {
      this.abortInertial()
    }
    if (event.touches.length !== 1) {
      /**
       * TODO: what to do if slide one more finger?
       */
    }
    this.touching = true
    const touchItem = event.touches.item(0)!
    this.touchPosX = touchItem.clientX
    this.touchPosY = touchItem.clientY
  }

  private handleTouchMove = (event: TouchEvent) => {
    if (!this.touching) {
      return
    }
    if (event.touches.length !== 1) {
      this.touching = false
    }
    if (this.options.preventDefault && this.getPosition().y > 0) {
      event.preventDefault()
    }
    const touchItem = event.touches.item(0)!
    const deltaX = this.options.allowScrollX ? this.touchPosX - touchItem.clientX : 0
    const deltaY = this.options.allowScrollY ? this.touchPosY - touchItem.clientY : 0
    this.touchPosX = touchItem.clientX
    this.touchPosY = touchItem.clientY
    const horizonMode = Math.abs(deltaX) > Math.abs(deltaY)
    const { fingerScrollSpeedRatio = 1 } = this.options
    if (this.touchSnapshotList.length >= SNAPSHOT_LENGTH) {
      this.touchSnapshotList.shift()
    }
    this.touchSnapshotList.push({
      deltaX: horizonMode ? deltaX * fingerScrollSpeedRatio : 0,
      deltaY: horizonMode ? 0 : deltaY * fingerScrollSpeedRatio,
      timestamp: Date.now(),
      direction: horizonMode ? DIRECTION.Horizon : DIRECTION.Vertical,
    })
    this.emit(FINGER_SCROLL_EVENT, {
      deltaX: horizonMode ? deltaX * fingerScrollSpeedRatio : 0,
      deltaY: horizonMode ? 0 : deltaY * fingerScrollSpeedRatio,
    } as ScrollPayload)
  }

  private handleTouchEnd = () => {
    this.touching = false
    this.generateInertial()
  }

  private handleTouchCancel = () => {
    this.touching = false
    this.generateInertial()
  }

  private generateInertial() {
    if (this.touchSnapshotList.length === 0) return
    let direction: DIRECTION | null = null
    let distance = 0
    let endTime = this.touchSnapshotList[this.touchSnapshotList.length - 1].timestamp
    let duration = 0
    for (let i = this.touchSnapshotList.length - 1; i >= 0; i--) {
      const snapshot = this.touchSnapshotList[i]
      if (direction && direction !== snapshot.direction) {
        duration = endTime - snapshot.timestamp
        break
      }
      direction = snapshot.direction
      distance += direction === DIRECTION.Horizon ? snapshot.deltaX : snapshot.deltaY
      if (i === 0) {
        duration = endTime - snapshot.timestamp
      }
    }
    const momentum = (distance / duration) * 16
    this.inertial = true
    requestAnimationFrame(() => this.execInertial(momentum, direction!, 0))
  }

  private abortInertial() {
    this.inertial = false
  }

  private execInertial(momentum: number, direction: DIRECTION, frame: number) {
    if (!this.inertial) {
      return
    }
    this.emit(FINGER_SCROLL_EVENT, {
      deltaX: direction === DIRECTION.Horizon ? momentum : 0,
      deltaY: direction === DIRECTION.Horizon ? 0 : momentum,
    } as ScrollPayload)

    if (momentum !== 0) {
      requestAnimationFrame(() =>
        this.execInertial(this.reduceMomentum(momentum, frame), direction!, frame + 1),
      )
    }
  }

  private reduceMomentum(momentum: number, frame: number) {
    return momentum > 0 ? Math.max(0, momentum - 1) : Math.min(0, momentum + 1)
  }
}
