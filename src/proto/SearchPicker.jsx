import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { setVariant, useVariant } from './store.js'
import './picker.css'

const NAMES = {
  s: ['Inline dropdown', 'Spotlight'],
  c: ['Sidebar steps', 'Tabs (current)'],
  i: ['Idea 1', 'Idea 2'],
  d: ['Create from default', 'Start from a template'],
}

/** Floating variant picker. `kind` selects which prototype it flips: s = search box, c = creation flow. */
export default function ProtoPicker({ kind, stacked }) {
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
      // Two pills can be on screen at once: the main one takes 1-2 and the arrows, the stacked one takes 3-4.
      const num = parseInt(e.key, 10) - (stacked ? 2 : 0)
      if (num >= 1 && num <= names.length) setVariant(kind, num)
      else if (!stacked && e.key === 'ArrowRight') setVariant(kind, (v % names.length) + 1)
      else if (!stacked && e.key === 'ArrowLeft') setVariant(kind, ((v - 2 + names.length) % names.length) + 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [v, kind])

  return (
    <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready ? '' : undefined} data-stack={stacked ? '' : undefined}>
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
