/**
 * 音效：WebAudio 实时合成，不加载任何音频文件（现场断网也能响）。
 * 默认静音；首次交互后才真正创建 AudioContext，避免浏览器自动播放策略报警。
 */

export type SoundName = 'ding' | 'pop' | 'whoosh' | 'fanfare'

let audioCtx: AudioContext | null = null
let muted = true

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      audioCtx = new Ctor()
    } catch {
      return null
    }
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

export function setMuted(value: boolean): void {
  muted = value
  if (!value) getContext()
}

export function isMuted(): boolean {
  return muted
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  peak = 0.08,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t0 = ctx.currentTime + start
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.03)
}

function noiseSweep(ctx: AudioContext): void {
  const duration = 0.42
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.9
  filter.frequency.setValueAtTime(280, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(4200, ctx.currentTime + duration * 0.75)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.07)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
  source.stop(ctx.currentTime + duration)
}

export function playSound(name: SoundName): void {
  if (muted) return
  const ctx = getContext()
  if (!ctx) return

  switch (name) {
    case 'ding':
      tone(ctx, 1180, 0, 0.16, 'sine', 0.07)
      tone(ctx, 1760, 0.03, 0.18, 'sine', 0.035)
      break
    case 'pop':
      tone(ctx, 260, 0, 0.12, 'triangle', 0.09)
      tone(ctx, 90, 0.02, 0.16, 'sine', 0.07)
      break
    case 'whoosh':
      noiseSweep(ctx)
      break
    case 'fanfare':
      tone(ctx, 523.25, 0, 0.18, 'triangle', 0.08)
      tone(ctx, 659.25, 0.11, 0.18, 'triangle', 0.08)
      tone(ctx, 783.99, 0.22, 0.22, 'triangle', 0.08)
      tone(ctx, 1046.5, 0.34, 0.34, 'triangle', 0.07)
      break
    default:
      break
  }
}
