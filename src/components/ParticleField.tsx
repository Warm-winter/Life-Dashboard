import { useEffect, useRef } from 'react'

const COLORS = ['#FFD54A', '#FF2D95', '#59E3FF', '#FFFFFF', '#7CFF6B']

interface Particle {
  x: number
  y: number
  r: number
  alpha: number
  vx: number
  vy: number
  rot: number
  vr: number
  phase: number
  color: string
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number): void {
  ctx.beginPath()
  for (let i = 0; i < 8; i += 1) {
    const angle = rot + (i * Math.PI) / 4
    const radius = i % 2 === 0 ? r : r * 0.34
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

/**
 * 星星粒子层。
 * 数量由 CSS 变量 --fx-particles 决定（各档位在 tokens.css 里），
 * 所以"几毛钱"这件事只有一个真相来源。
 */
export function ParticleField({ fx }: { fx: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const declared = Number.parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--fx-particles').trim(),
      10,
    )
    const total = reduced || !Number.isFinite(declared) ? 0 : Math.min(140, declared)

    let width = window.innerWidth
    let height = window.innerHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    if (total === 0) {
      ctx.clearRect(0, 0, width, height)
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }

    const particles: Particle[] = Array.from({ length: total }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.4 + Math.random() * 3.4,
      alpha: 0.25 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -0.08 - Math.random() * 0.28,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    let raf = 0
    let last = performance.now()

    const render = (now: number) => {
      const step = Math.min(2.4, Math.max(0.2, (now - last) / 16.67))
      last = now
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      for (const p of particles) {
        p.x += p.vx * step
        p.y += p.vy * step
        p.rot += p.vr * step
        if (p.y < -24) {
          p.y = height + 24
          p.x = Math.random() * width
        }
        if (p.x < -24) p.x = width + 24
        if (p.x > width + 24) p.x = -24

        const twinkle = 0.55 + 0.45 * Math.sin(now / 460 + p.phase)
        ctx.globalAlpha = Math.max(0, p.alpha * twinkle)
        ctx.fillStyle = p.color
        drawStar(ctx, p.x, p.y, p.r, p.rot)
      }
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    window.addEventListener('resize', resize)

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else {
        last = performance.now()
        raf = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      ctx.clearRect(0, 0, width, height)
    }
  }, [fx])

  return <canvas ref={canvasRef} className="particles" aria-hidden="true" />
}
