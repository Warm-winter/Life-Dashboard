import { type RefObject, useEffect, useRef, useState } from 'react'

/** 量容器宽度：图表按真实像素绘制，避免 viewBox 缩放把字压小。 */
export function useMeasure<T extends HTMLElement>(): [RefObject<T>, number] {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.getBoundingClientRect().width)

    if (typeof ResizeObserver === 'undefined') {
      const onResize = () => setWidth(el.getBoundingClientRect().width)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0
      setWidth((prev) => (Math.abs(prev - next) > 0.5 ? next : prev))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}
