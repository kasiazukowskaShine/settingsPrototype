import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ICONS } from '../Icon.jsx'
import { searchSettings } from '../data.js'
import './spotlight.css'

const SUGGESTIONS = ['footer', 'message', 'columns', 'discount', 'quote validity', 'terms']

/** Variant 2: the search box is a button; clicking it opens a centered Spotlight-style palette. */
export default function SpotlightSearch({ templates, onPick }) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const trigger = useRef(null)
  const input = useRef(null)
  const listId = useId()
  const results = useMemo(() => searchSettings(q, templates), [q, templates])

  const close = (restoreFocus = true) => {
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
      setQ('')
      setActive(0)
      if (restoreFocus) trigger.current?.focus()
    }, 120)
  }

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  const pick = (r) => {
    close(false)
    onPick(r)
  }

  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation() // don't let the settings modal's own Escape handler fire
      close()
    } else if (e.key === 'ArrowDown' && results.length) {
      setActive((active + 1) % results.length)
      e.preventDefault()
    } else if (e.key === 'ArrowUp' && results.length) {
      setActive((active + results.length - 1) % results.length)
      e.preventDefault()
    } else if (e.key === 'Enter' && results[active]) pick(results[active])
  }

  return (
    <>
      <button ref={trigger} className="sinp spot-trigger" onClick={() => setOpen(true)} aria-haspopup="dialog">
        {ICONS.search()}
        <span>Search</span>
      </button>
      {open &&
        createPortal(
          <div className={'spot-scrim' + (closing ? ' out' : '')} onMouseDown={(e) => e.target === e.currentTarget && close()}>
            <div className="spot" role="dialog" aria-modal="true" aria-label="Search settings">
              <div className="spot-in">
                {ICONS.search()}
                <input
                  ref={input}
                  value={q}
                  placeholder="Search settings"
                  autoComplete="off"
                  spellCheck={false}
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls={listId}
                  aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                  aria-label="Search settings"
                  onChange={(e) => {
                    setQ(e.target.value)
                    setActive(0)
                  }}
                  onKeyDown={onKey}
                />
              </div>
              {q.trim() === '' ? (
                <div className="spot-sug">
                  <div className="spot-lbl">Try</div>
                  <div className="spot-chips">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => { setQ(s); input.current?.focus() }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="spot-list" id={listId} role="listbox">
                  {results.length === 0 ? (
                    <div className="spot-none">No results for “{q}”</div>
                  ) : (
                    results.map((r, i) => (
                      <div
                        key={i}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === active}
                        className={'spot-row' + (i === active ? ' on' : '')}
                        onMouseMove={() => i !== active && setActive(i)}
                        onClick={() => pick(r)}
                      >
                        <div>
                          <b>{r.title}</b>
                          <span>{r.path}</span>
                        </div>
                        {r.tag && <em>{r.tag}</em>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
