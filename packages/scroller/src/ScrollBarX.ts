import { ScrollerOptions } from '.';
import { ScrollBar } from './ScrollBar';
import { addStyle } from './utils/dom';

export class ScrollBarX extends ScrollBar {
  constructor(scrollEl: HTMLElement, options: ScrollerOptions) {
    super(scrollEl, options)
  }

  public render() {
    super.render()
    if (this.visible && this.cursorEl) {
      addStyle(this.cursorEl, {
        width: `${this.cursorLength}px`,
      })
    }
  }

  protected isVisible() {
    if (!this.options.allowScrollX || !this.options.scrollbarVisibleX) {
      return false
    }
    return this.scrollEl.offsetWidth < this.stageWidth
  }

  protected getContainerStyle(): Partial<CSSStyleDeclaration> {
    const commonStyle = super.getContainerStyle()
    return {
      ...commonStyle,
      left: '0',
      bottom: '0',
      width: '100%',
    }
  }

  protected getCursorStyle(): Partial<CSSStyleDeclaration> {
    const commonStyle = super.getCursorStyle()
    return {
      ...commonStyle,
      height: '100%',
      width: `${this.cursorLength}px`,
      minWidth: '30px',
    }
  }

  protected getCursorLength() {
    return (this.scrollEl.offsetWidth / this.stageWidth) * this.scrollEl.offsetWidth
  }

  protected updatePosition() {
    const offsetPercent = this.position * 100
    if (this.cursorEl) {
      addStyle(this.cursorEl, {
        left: `${offsetPercent}%`,
        transform: `translate(${-offsetPercent}%, 0)`,
      })
    }
  }

  protected getClassName() {
    return this.options.scrollBarClassNameX || ''
  }

  protected handleMouseMove = (e: MouseEvent) => {
    if (!this.dragging) {
      return
    }
    e.preventDefault()
    const delta = e.clientX - this.dragPosX
    this.dragPosX = e.clientX
    this.scrollTo(delta * (this.stageWidth / (this.scrollEl.clientWidth - this.cursorLength)), 0)
  }
}
