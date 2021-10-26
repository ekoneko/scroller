import EventEmitter from 'eventemitter3';

import { ScrollerOptions, ScrollPayload } from '.';
import { addStyle, createElement } from './utils/dom';

export const SCROLLBAR_SCROLL_EVENT = 'SCROLLBAR_SCROLL_EVENT'

export abstract class ScrollBar extends EventEmitter {
  public containerEl?: HTMLElement
  public cursorEl?: HTMLElement
  public visible: boolean
  public position: number
  public cursorLength: number
  protected scrollEl: HTMLElement
  protected options: ScrollerOptions
  protected stageWidth: number
  protected stageHeight: number
  protected dragging: boolean
  protected dragPosX: number
  protected dragPosY: number
  protected active: boolean = false
  protected hover: boolean = false
  protected delayRemoveActiveHandler?: number

  constructor(scrollEl: HTMLElement, options: ScrollerOptions) {
    super()
    this.scrollEl = scrollEl
    this.options = options
    this.visible = false
  }

  public render() {
    this.visible = this.isVisible()
    if (this.visible) {
      this.cursorLength = this.getCursorLength()
      if (!this.containerEl) {
        this.createEl()
      } else {
        addStyle(this.containerEl, {
          display: 'block',
        })
      }
    } else if (this.containerEl) {
      addStyle(this.containerEl, {
        display: 'none',
      })
    }
  }

  public update(stageWidth: number, stageHeight: number) {
    this.stageWidth = stageWidth
    this.stageHeight = stageHeight
    this.render()
  }

  public setPosition(position: number) {
    this.position = position
    this.updatePosition()
    this.setActive()
    if (!this.hover && !this.dragging) {
      this.delayRemoveActive()
    }
  }

  public destroy() {
    this.containerEl && this.containerEl.remove()
    this.scrollEl.removeEventListener('mousemove', this.handleMouseMove)
    this.scrollEl.removeEventListener('mouseup', this.handleMouseUp)
  }

  protected abstract isVisible(): boolean
  protected abstract getCursorLength(): number
  protected abstract updatePosition(): void
  protected abstract getClassName(): string

  protected createEl() {
    const containerClassName = this.getClassName()
    this.containerEl = createElement('div', {
      dataTest: 'scrollbar-container'
    }, this.getContainerStyle())
    this.containerEl.className = containerClassName
    this.cursorEl = createElement('div', {
      dataTest: 'scrollbar-cursor'
    }, this.getCursorStyle())
    this.containerEl.appendChild(this.cursorEl)
    this.scrollEl.appendChild(this.containerEl)
    if (this.options.hiddenInactiveScrollbar) {
      addStyle(this.containerEl, {
        opacity: '0',
      })
    }

    this.containerEl.addEventListener('mouseenter', this.handleMouseEnter)
    this.containerEl.addEventListener('mouseleave', this.handleMouseLeave)
    this.containerEl.addEventListener('mousedown', this.handleMouseDown)
    this.scrollEl.addEventListener('mousemove', this.handleMouseMove)
    this.scrollEl.addEventListener('mouseup', this.handleMouseUp)
  }

  protected getContainerStyle(): Partial<CSSStyleDeclaration> {
    return {
      position: 'absolute',
    }
  }

  protected getCursorStyle(): Partial<CSSStyleDeclaration> {
    return {
      position: 'relative',
    }
  }

  protected setActive() {
    this.active = true
    if (this.options.hiddenInactiveScrollbar) {
      this.containerEl &&
        addStyle(this.containerEl, {
          opacity: '1',
        })
    }
    if (this.delayRemoveActiveHandler) {
      clearTimeout(this.delayRemoveActiveHandler)
      delete this.delayRemoveActiveHandler
    }
  }

  protected removeActive() {
    this.active = false
    if (this.options.hiddenInactiveScrollbar) {
      this.containerEl &&
        addStyle(this.containerEl, {
          opacity: '0',
        })
    }
    if (this.delayRemoveActiveHandler) {
      clearTimeout(this.delayRemoveActiveHandler)
      delete this.delayRemoveActiveHandler
    }
  }

  protected delayRemoveActive(delay = 400) {
    this.delayRemoveActiveHandler = window.setTimeout(() => this.removeActive(), delay)
  }

  protected handleMouseEnter = () => {
    this.hover = true
    this.setActive()
  }

  protected handleMouseLeave = () => {
    this.hover = false
    if (!this.dragging && this.active) {
      this.removeActive()
    }
  }

  protected handleMouseDown = (event: MouseEvent) => {
    this.dragging = true
    this.dragPosX = event.clientX
    this.dragPosY = event.clientY
  }

  protected abstract handleMouseMove(event: MouseEvent): void

  protected handleMouseUp = () => {
    this.dragging = false
    if (!this.hover && this.active) {
      this.removeActive()
    }
  }

  protected scrollTo(deltaX: number, deltaY: number) {
    const { dragScrollSpeedRatio = 1 } = this.options
    this.emit(SCROLLBAR_SCROLL_EVENT, {
      deltaX: deltaX * dragScrollSpeedRatio,
      deltaY: deltaY * dragScrollSpeedRatio,
    } as ScrollPayload)
  }
}
