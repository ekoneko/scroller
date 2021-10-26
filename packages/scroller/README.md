# @ekoneko/scroller

Another scroll emulator

## How to use

```ts
const scrollEl = document.getElementById('scroll')
const scroller = new Scroller(scrollEl, scrollOptions)
const scroller.init()
// ...
const scroller.destroy()
```

## Configure

### Constructor Options

#### options.wheelScrollSpeedRatio

Speed rate by mouse wheel or touch pad

Default: `1`

#### options.dragScrollSpeedRatio

Speed rate by drag scrollbar

Default: `1`

#### options.fingerScrollSpeedRatio

Speed rate by swipe finger

Default: `1`

#### options.preventDefault

Prevent original events (scroll, touch, etc)

Default: `true`

#### options.allowScrollX

Allowed scroll in horizon

Default: `true`

#### options.allowScrollY

Allowed scroll in vertical

Default: `true`

### options.scrollBarClassNameX

Horizon scrollbar className

### options.scrollBarClassNameY

Vertical scrollbar className

### options.scrollbarVisibleX

Horizon scrollbar visible

### options.scrollbarVisibleY

Vertical scrollbar visible

### options.hiddenInactiveScrollbar

Hidden scrollbar when inactive

### options.smoothFn

Custom scroll smooth function

```ts
interface SmoothData {
  fromX: number
  fromY: number
  toX: number
  toY: number
  nowX?: number
  nowY?: number
  // executed count. from 0, increase 1 each execute
  frameCount?: number
}

type smoothFn = (smoothData: SmoothData) => SmoothData | undefined
```

smoothFn will stop if return `undefined`

Default: [default smooth function](src/utils/smooth.ts)

## Method

### scroller.destroy()

Destroy scrollbar

### scroller.update(maxX?: number, maxY?: number, minX?: number, minY?: number)

Update scroller

NOTICE: need call update manually when scroller container size change.

Scroller will auto compute bound size without special params.

minX and minY can reduce than 0.

### scroller.setPosition(x: number, y: number, smooth?: boolean)

Set scroller position with absolute coordinate.

When set smooth flag, the scroll behavior will execute with an animation.

### scroller.setOffset(x: number, y: number, smooth?: boolean)

Set scroller offset with relative coordinate.

### scroller.getPosition()

get scroller position

## Event

### EVENT_SCROLL

```ts
scroller.on(Scroller.EVENT_SCROLL, (e: { x: number; y: number }) => {
  //
})
```

## TODO

1. Improve inertial scroll
