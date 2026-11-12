import { useEffect, useId, useRef, useState } from 'react'

const FLAGS = {
  fr: (
    <>
      <rect width="7" height="14" fill="#3a4aa8" />
      <rect x="7" width="6" height="14" fill="#fff" />
      <rect x="13" width="7" height="14" fill="#e03a2e" />
    </>
  ),
  it: (
    <>
      <rect width="7" height="14" fill="#1f9d55" />
      <rect x="7" width="6" height="14" fill="#fff" />
      <rect x="13" width="7" height="14" fill="#e03a2e" />
    </>
  ),
  de: (
    <>
      <rect width="20" height="5" fill="#222" />
      <rect y="5" width="20" height="4" fill="#e03a2e" />
      <rect y="9" width="20" height="5" fill="#f2c230" />
    </>
  ),
  es: (
    <>
      <rect width="20" height="14" fill="#e03a2e" />
      <rect y="3.5" width="20" height="7" fill="#f2c230" />
    </>
  ),
  gb: (
    <>
      <rect width="20" height="14" fill="#3a4aa8" />
      <path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.6" />
      <path d="M0 0L20 14M20 0L0 14" stroke="#e03a2e" strokeWidth="1" />
      <path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="4.4" />
      <path d="M10 0V14M0 7H20" stroke="#e03a2e" strokeWidth="2.4" />
    </>
  ),
  us: (
    <>
      <rect width="20" height="14" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="20" height="1.2" fill="#e03a2e" />
      ))}
      <rect width="9" height="7.6" fill="#3a4aa8" />
    </>
  ),
}

function Flag({ code }) {
  return (
    <span className="flag" aria-hidden="true">
      <svg viewBox="0 0 20 14" width="26" height="18">
        {FLAGS[code]}
      </svg>
    </span>
  )
}

const LANGUAGES = [
  { value: 'French', flag: 'fr' },
  { value: 'English', flag: 'gb' },
  { value: 'German', flag: 'de' },
  { value: 'Spanish', flag: 'es' },
  { value: 'Italian', flag: 'it' },
]
const CURRENCIES = [
  { value: 'EUR', flag: 'fr' },
  { value: 'USD', flag: 'us' },
  { value: 'GBP', flag: 'gb' },
]

/** Select with a flag beside each option, which a native <select> can't render. */
function FlagSelect({ value, opts, onChange, labelledBy }) {
  const [open, setOpen] = useState(false)
  const [act, setAct] = useState(0)
  const root = useRef(null)
  const listId = useId()
  const idx = Math.max(0, opts.findIndex((o) => o.value === value))
  const cur = opts[idx]

  useEffect(() => {
    if (!open) return
    const away = (e) => !root.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open])

  const choose = (o) => {
    onChange(o.value)
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        setAct(idx)
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.stopPropagation() // close the list only, not the settings modal
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAct((act + 1) % opts.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAct((act + opts.length - 1) % opts.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(opts[act])
    } else if (e.key === 'Tab') setOpen(false)
  }

  return (
    <div className="fsel" ref={root} onKeyDown={onKeyDown}>
      <button type="button" className="sel fsel-btn" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={labelledBy} onClick={() => { setAct(idx); setOpen(!open) }}>
        <Flag code={cur.flag} />
        {cur.value}
      </button>
      {open && (
        <div className="fsel-menu" role="listbox" id={listId}>
          {opts.map((o, i) => (
            <div key={o.value} role="option" aria-selected={o.value === value} className={'fsel-opt' + (i === act ? ' on' : '')} onMouseMove={() => setAct(i)} onClick={() => choose(o)}>
              <Flag code={o.flag} />
              {o.value}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ITEM_TYPES = ['Product', 'Service', 'Mixed']
export const PAYMENT_TERMS = ['Due on receipt', '15 days', '30 days', '45 days', '60 days']

function Row({ id, label, children }) {
  return (
    <div>
      <span className="fl" id={id}>
        {label}
      </span>
      {children}
    </div>
  )
}

/** Template-level defaults shown on the General tab. `Fld` wraps each block so search can scroll to and highlight it. */
export default function GeneralPresets({ t, set, hl, Fld }) {
  const p = t.presets
  const c = p.contact
  const id = useId()
  return (
    <>
      <div className="pgrid">
        <Fld id="language" hl={hl}>
          <Row id={id + 'l'} label="Language">
            <FlagSelect value={p.language} opts={LANGUAGES} onChange={(v) => set('presets.language', v)} labelledBy={id + 'l'} />
          </Row>
        </Fld>
        <Fld id="currency" hl={hl}>
          <Row id={id + 'c'} label="Currency">
            <FlagSelect value={p.currency} opts={CURRENCIES} onChange={(v) => set('presets.currency', v)} labelledBy={id + 'c'} />
          </Row>
        </Fld>
        <Fld id="itemType" hl={hl}>
          <label className="fl" htmlFor={id + 'i'}>
            Item type
          </label>
          <select className="sel" id={id + 'i'} value={p.itemType} onChange={(e) => set('presets.itemType', e.target.value)}>
            {ITEM_TYPES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Fld>
        <Fld id="terms" hl={hl}>
          <label className="fl" htmlFor={id + 't'}>
            Payment terms
          </label>
          <select className="sel" id={id + 't'} value={p.terms} onChange={(e) => set('presets.terms', e.target.value)}>
            {PAYMENT_TERMS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Fld>
      </div>
      <Fld id="contact" hl={hl}>
        <span className="fl">Contact person</span>
        <div className="cbox">
          <div>
            <label className="fl" htmlFor={id + 'f'}>
              First name
            </label>
            <input id={id + 'f'} className="inp" placeholder="First name" value={c.first} maxLength={40} autoComplete="off" onChange={(e) => set('presets.contact.first', e.target.value)} />
          </div>
          <div>
            <label className="fl" htmlFor={id + 'n'}>
              Last name
            </label>
            <input id={id + 'n'} className="inp" placeholder="Last name" value={c.last} maxLength={40} autoComplete="off" onChange={(e) => set('presets.contact.last', e.target.value)} />
          </div>
          <div>
            <label className="fl" htmlFor={id + 'e'}>
              Email
            </label>
            <input id={id + 'e'} className="inp" type="email" placeholder="name@business.com" value={c.email} maxLength={80} autoComplete="off" onChange={(e) => set('presets.contact.email', e.target.value)} />
          </div>
          <div>
            <label className="fl" htmlFor={id + 'p'}>
              Phone number
            </label>
            <input id={id + 'p'} className="inp" type="tel" placeholder="+33 6 12 34 56 78" value={c.phone} maxLength={30} autoComplete="off" onChange={(e) => set('presets.contact.phone', e.target.value)} />
          </div>
        </div>
      </Fld>
    </>
  )
}
