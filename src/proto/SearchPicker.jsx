import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { setVariant, useVariant } from './store.js'
import './picker.css'

const NAMES = {
  i: ['Idea 1', 'Idea 2'],
  d: ['Create from default', 'Start from a template'],
}

/**
 * Floating variant picker. `kind` selects which prototype it flips.
 * `level` is its place in the stack: 0 is the bottom pill (idea), higher levels stack above it.
 * Level 0 takes 1-2 and the arrows; each level above takes the next keys after the ones below.
 */
export default function ProtoPicker({ kind, level = 0 }) {
  const names = NAMES[kind]
  const v = useVariant(kind)
  const items = useRef([])
  const [hl, setHl] = useState({ w: 0, x: 0 })
  const [ready, setReady] = useState(false)

  const measure = () => {
    const el = items.current[v - 1]
    if (el) setHl({ w: el.offsetWidth, x: el.offsetLeft })
  }
  useLayoutEffect(measure, [v, kind])
  useEffect(() => {
    window.addEventListener('resize', measure)
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const num = parseInt(e.key, 10) - level * 2
      if (num >= 1 && num <= names.length) setVariant(kind, num)
      else if (level === 0 && e.key === 'ArrowRight') setVariant(kind, (v % names.length) + 1)
      else if (level === 0 && e.key === 'ArrowLeft') setVariant(kind, ((v - 2 + names.length) % names.length) + 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [v, kind, level])

  return (
    <nav
      className="proto-picker"
      aria-label="Prototype variants"
      data-ready={ready ? '' : undefined}
      style={level ? { bottom: 24 + level * 44 } : undefined}
    >
      <span className="proto-picker-highlight" aria-hidden="true" style={{ width: hl.w, transform: `translateX(${hl.x}px)` }} />
      {names.map((n, i) => (
        <button
          key={n}
          ref={(el) => (items.current[i] = el)}
          className="proto-picker-item"
          data-active={v === i + 1 ? '' : undefined}
          aria-current={v === i + 1 ? 'true' : undefined}
          onClick={() => setVariant(kind, i + 1)}
        >
          {n}
        </button>
      ))}
    </nav>
  )
}
