"use client";

// Adapted from page-mascot, MIT, copyright (c) Kamran Ahmed.
// License: public/licenses/page-mascot.txt
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { advanceTracking, createTrackingState, directionName, pointerTarget } from '@/lib/mascot-tracking'
import type { DirectionGrid, LookTarget } from '@/lib/mascot-tracking'

const REACTIONS = [
  'blink',
  'heart',
  'sparkle',
  'surprised',
  'wink',
  'bashful',
  'sleepy',
  'dizzy',
  'delighted',
] as const

type Reaction = (typeof REACTIONS)[number]

const PAYOFFS: Reaction[] = ['heart', 'sparkle', 'delighted']
const BOOP_PAYOFF = 120
const BOOP_END = 560
const SQUASH_MS = 420
const DIZZY_AFTER = 4
const DIZZY_WINDOW = 1600
const DIZZY_END = 1100

const SQUASH: Keyframe[] = [
  { transform: 'scale(1, 1)', easing: 'ease-in' },
  { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
  { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
  { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
  { transform: 'scale(1, 1)' },
]

// background-size 300% makes each cell a clean 0/50/100% step on both axes.
function cell(index: number, grid = 3): CSSProperties {
  const step = 100 / (grid - 1)
  return { backgroundPosition: `${(index % grid) * step}% ${Math.floor(index / grid) * step}%` }
}

const layer: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: '300% 300%',
  backgroundRepeat: 'no-repeat',
}

export type MascotProps = {
  /** The head-direction sheet. A served path, or an imported image. */
  directions: string
  /** The 3x3 sheet of expressions. */
  reactions: string
  size?: number
  className?: string
  /** What a screen reader calls it. */
  label?: string
  /** Suspend tracking while the portrait is flipped to its photo. */
  tracking?: boolean
  directionGrid?: DirectionGrid
}

export function SmoothMascot(props: MascotProps) {
  const { directions, reactions, size = 140, className, label = 'mascot', tracking = true, directionGrid = 3 } = props

  const buttonRef = useRef<HTMLButtonElement>(null)
  const squashRef = useRef<HTMLSpanElement>(null)
  const directionRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const timersRef = useRef<number[]>([])
  const boopsRef = useRef({ count: 0, at: 0 })
  const [reaction, setReaction] = useState<Reaction | null>(null)

  useEffect(() => {
    const layer = directionRef.current
    if (!layer) return
    const paint = (pose: number) => {
      layer.style.backgroundPosition = cell(pose, directionGrid).backgroundPosition as string
      layer.dataset.direction = directionName(pose, directionGrid)
    }
    const center = Math.floor(directionGrid * directionGrid / 2)
    paint(center)
    layer.dataset.tracking = 'idle'
    layer.dataset.ready = 'true'
    if (!tracking) return
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let enabled = finePointer.matches && !reducedMotion.matches
    const state = createTrackingState(directionGrid)
    let target: LookTarget = { x: 0, y: 0, away: false }
    let pointer: { x: number; y: number } | null = null
    let frame = 0
    let previousTime = 0

    const tick = (time: number) => {
      frame = 0
      const result = advanceTracking(state, target, previousTime ? time - previousTime : 16, time)
      previousTime = time
      if (layer.dataset.direction !== directionName(result.pose, directionGrid)) paint(result.pose)
      layer.dataset.tracking = result.settled ? 'idle' : 'moving'
      if (!result.settled) frame = window.requestAnimationFrame(tick)
      else previousTime = 0
    }
    const wake = () => {
      if (!frame && enabled && !document.hidden) frame = window.requestAnimationFrame(tick)
    }
    const aim = () => {
      const button = buttonRef.current
      if (!enabled || !button || !pointer) return
      const box = button.getBoundingClientRect()
      target = pointerTarget(pointer.x - box.left - box.width / 2, pointer.y - box.top - box.height / 2, target.away, directionGrid)
      wake()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer = { x: event.clientX, y: event.clientY }
      aim()
    }
    const relax = () => {
      pointer = null
      target = { x: 0, y: 0, away: false }
      wake()
    }
    const stop = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      pointer = null
      target = { x: 0, y: 0, away: false }
      Object.assign(state, createTrackingState(directionGrid))
      paint(center)
      layer.dataset.tracking = 'idle'
    }
    const onPreferenceChange = () => {
      enabled = finePointer.matches && !reducedMotion.matches
      if (reducedMotion.matches) animationRef.current?.cancel()
      stop()
    }
    const onVisibilityChange = () => { if (document.hidden) stop() }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', aim, { passive: true })
    window.addEventListener('resize', aim, { passive: true })
    window.addEventListener('blur', relax)
    document.documentElement.addEventListener('pointerleave', relax)
    document.addEventListener('visibilitychange', onVisibilityChange)
    finePointer.addEventListener('change', onPreferenceChange)
    reducedMotion.addEventListener('change', onPreferenceChange)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', aim)
      window.removeEventListener('resize', aim)
      window.removeEventListener('blur', relax)
      document.documentElement.removeEventListener('pointerleave', relax)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      finePointer.removeEventListener('change', onPreferenceChange)
      reducedMotion.removeEventListener('change', onPreferenceChange)
      window.cancelAnimationFrame(frame)
    }
  }, [tracking, directionGrid])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout)
      animationRef.current?.cancel()
    }
  }, [])

  const boop = () => {
    timersRef.current.forEach(window.clearTimeout)
    timersRef.current = []

    const later = (ms: number, next: Reaction | null) => {
      timersRef.current.push(window.setTimeout(() => setReaction(next), ms))
    }

    const now = Date.now()
    const boops = boopsRef.current
    boops.count = now - boops.at < DIZZY_WINDOW ? boops.count + 1 : 1
    boops.at = now

    if (boops.count >= DIZZY_AFTER) {
      boops.count = 0
      setReaction('dizzy')
      later(DIZZY_END, null)
    } else {
      setReaction('blink')
      later(BOOP_PAYOFF, PAYOFFS[(boops.count - 1) % PAYOFFS.length])
      later(BOOP_END, null)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Per-keyframe easing with the effect itself linear: an easing on the effect
    // would reinterpret every offset and front-load the whole bounce.
    animationRef.current?.cancel()
    animationRef.current = squashRef.current?.animate(SQUASH, { duration: SQUASH_MS, easing: 'linear' }) ?? null
  }

  // Inline styles so the file drops into any project without a CSS framework.
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={boop}
      aria-label={`Boop the ${label}`}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: 'transparent',
        appearance: 'none',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span
        ref={squashRef}
        style={{ position: 'relative', display: 'block', width: '100%', height: '100%', transformOrigin: '50% 78%' }}
      >
        <span
          ref={directionRef}
          data-direction="center"
          data-tracking="idle"
          data-grid={directionGrid}
          style={{
            ...layer,
            backgroundImage: `url(${directions})`,
            backgroundSize: `${directionGrid * 100}% ${directionGrid * 100}%`,
            ...cell(Math.floor(directionGrid * directionGrid / 2), directionGrid),
            opacity: reaction ? 0 : 1,
          }}
        />
        {/* Always mounted so the sheet is fetched up front, never on the first click. */}
        <span
          style={{
            ...layer,
            backgroundImage: `url(${reactions})`,
            ...cell(REACTIONS.indexOf(reaction ?? 'blink')),
            opacity: reaction ? 1 : 0,
          }}
        />
      </span>
    </button>
  )
}
