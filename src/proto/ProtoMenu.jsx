import { useEffect, useRef, useState } from 'react'
import { setVariant, useVariant } from './store.js'
import './picker.css'

/**
 * Prototype settings. One menu instead of a stack of pills: pick the version, the layout it renders,
 * whether create flows keep the app navbar, which side the preview sits on, and (on V1) how
 * Invoices/Quotes are entered.
 */
const GROUPS = [
  { key: 'v', label: 'Version', options: ['V1', 'V2'] },
  { key: 'i', label: 'Layout', options: ['Lumen as is', 'Idea 2', 'Idea 3'], when: (s) => s.v === 2 },
  { key: 'n', label: 'Navbar in create flows', options: ['Hidden', 'Visible'], when: (s) => s.v === 2 },
  { key: 'd', label: 'Document entry', options: ['Create from default', 'Start from a template'], when: (s) => s.v === 1 },
  { key: 'p', label: 'Preview side', options: ['Right', 'Left'] },
]

export default function ProtoMenu() {
  const s = { v: useVariant('v'), i: useVariant('i'), d: useVariant('d'), p: useVariant('p'), n: useVariant('n') }
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const groups = GROUPS.filter((g) => !g.when || g.when(s))

  // Close on Escape or a click outside, so the menu never sits over the thing being judged.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && (e.stopPropagation(), setOpen(false))
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  // Number keys still flip the layout, which is what you do most while comparing.
  useEffect(() => {
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey || s.v !== 2) return
      const n = parseInt(e.key, 10)
      const max = GROUPS[1].options.length
      if (n >= 1 && n <= max) setVariant('i', n)
      else if (e.key === 'ArrowRight') setVariant('i', (s.i % max) + 1)
      else if (e.key === 'ArrowLeft') setVariant('i', ((s.i - 2 + max) % max) + 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [s.v, s.i])

  const label = s.v === 1 ? 'V1' : GROUPS[1].options[s.i - 1] + (s.n === 2 ? ' · navbar' : '')

  return (
    <div className="pm" ref={root}>
      {open && (
        <div className="pm-panel" role="group" aria-label="Prototype settings">
          {groups.map((g) => (
            <div className="pm-g" key={g.key}>
              <div className="pm-l">{g.label}</div>
              <div className="pm-opts">
                {g.options.map((o, n) => (
                  <button
                    key={o}
                    className="pm-o"
                    data-active={s[g.key] === n + 1 ? '' : undefined}
                    aria-pressed={s[g.key] === n + 1}
                    onClick={() => setVariant(g.key, n + 1)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="pm-trigger" onClick={() => setOpen((x) => !x)} aria-expanded={open}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h10M18 7h2M4 17h6M14 17h6M4 12h2M10 12h10" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="12" cy="17" r="2" />
          <circle cx="8" cy="12" r="2" />
        </svg>
        {label}
      </button>
    </div>
  )
}
