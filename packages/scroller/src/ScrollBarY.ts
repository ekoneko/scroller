import { ScrollerOptions } from '.';
import { ScrollBar } from './ScrollBar';
import { addStyle } from './utils/dom';

export class ScrollBarY extends ScrollBar {
  constructor(scrollEl: HTMLElement, options: ScrollerOptions) {
    super(scrollEl, options)
  }

  public render() {
    super.render()
    if (this.visible && this.cursorEl) {
      addStyle(this.cursorEl, {
        height: `${this.cursorLength}px`,
      })
    }
  }

  protected isVisible() {
    if (!this.options.allowScrollY || !this.options.scrollbarVisibleY) {
      return false
    }
    return this.scrollEl.offsetHeight < this.stageHeight
  }

  protected getContainerStyle(): Partial<CSSStyleDeclaration> {
    const commonStyle = super.getContainerStyle()
    return {
      ...commonStyle,
      right: '0',
      top: '0',
      height: '100%',
    }
  }

  protected getCursorStyle(): Partial<CSSStyleDeclaration> {
    const commonStyle = super.getCursorStyle()
    return {
      ...commonStyle,
      width: '100%',
      height: `${this.cursorLength}px`,
      minHeight: '30px',
    }
  }

  protected getCursorLength() {
    return (this.scrollEl.offsetHeight / this.stageHeight) * this.scrollEl.offsetHeight
  }

  protected updatePosition() {
    if (this.cursorEl) {
      const offsetPercent = this.position * 100
      addStyle(this.cursorEl, {
        top: `${offsetPercent}%`,
        transform: `translate(0, ${-offsetPercent}%)`,
      })
    }
  }

  protected getClassName() {
    return this.options.scrollBarClassNameY || ''
  }

  protected handleMouseMove = (e: MouseEvent) => {
    if (!this.dragging) {
      return
    }
    e.preventDefault()
    const delta = e.clientY - this.dragPosY
    this.dragPosY = e.clientY
    this.scrollTo(0, delta * (this.stageHeight / (this.scrollEl.clientHeight - this.cursorLength)),)
  }
}
