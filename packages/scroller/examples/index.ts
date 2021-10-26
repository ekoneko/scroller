import { EVENT_SCROLL, Scroller, ScrollEventPayload } from '../src';

declare var window: any
declare var module: any

if (typeof module === 'object' && module.hot && window.scroller) {
  // hmr
  window.scroller.destroy()
};

(() => {
  const contentEl = document.getElementById('content')
  for (let i = 0; i < 100; i++) {
    contentEl!.innerHTML += `<div class="content-item">${i}</div>`
  }
})()

window.scroller = new Scroller(document.getElementById('scroll')!, {
  wheelScrollSpeedRatio: 1,
  dragScrollSpeedRatio: 1,
  scrollBarClassNameX: 'scrollbar-x',
  scrollBarClassNameY: 'scrollbar-y',
})

window.scroller.on(EVENT_SCROLL, (e: ScrollEventPayload) => {
  console.log(e)
})
