import { Scroller as ScrollerCore, ScrollerOptions } from '@ekoneko/scroller'
import React from 'react'

export interface ScrollerProps {
  children: React.ReactElement | ((scroller?: ScrollerCore) => React.ReactElement)
  options?: ScrollerOptions
  className?: string
}

export const Scroller: React.FC<ScrollerProps> = ({ children, options, className }) => {
  const scrollerRef = React.useRef<ScrollerCore>()
  const scrollElementRef = React.useRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>

  React.useEffect(() => {
    scrollerRef.current = new ScrollerCore(scrollElementRef.current!, options)
    return () => scrollerRef.current?.destroy()
  }, [])

  return (
    <div className={className} ref={scrollElementRef}>
      {typeof children === 'function' ? children(scrollerRef.current) : children}
    </div>
  )
}
