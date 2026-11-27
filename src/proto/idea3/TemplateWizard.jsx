import { useEffect, useId, useRef, useState } from 'react'
import Paper from '../../Paper.jsx'
import { Sw } from '../../TemplateEditor.jsx'
import { CURRENCIES, FlagSelect, ITEM_TYPES, LANGUAGES, PAYMENT_TERMS } from '../../GeneralPresets.jsx'
import { ICONS } from '../../Icon.jsx'
import { clone, eff, setP } from '../../data.js'
import './wizard.css'

/**
 * V3: "Create template" is a step-by-step wizard instead of one tabbed form. It opens on a pick screen (no sidebar):
 * which settings to customise. Continue brings in the step list with General plus only what was picked.
 * Editing an existing template uses the same layout without the pick screen: its steps are what it was created with
 * (all of them for templates that predate this flow). Every step in the list can be clicked, in both modes.
 * Renders the step list and main column only: it lives inside the settings sheet (IdeaThree keeps that frame
 * mounted and gives it the `wz` class) so opening it morphs the sheet instead of swapping it.
 */
const STEPS = [
  ['general', 'General'],
  ['inv', 'Invoice'],
  ['quo', 'Quote'],
  ['brand', 'Branding'],
  ['pay', 'Payments and reminders'],
]
const PICKS = STEPS.slice(1)
const TOTALS = ['Total', 'Excluding VAT only', 'Including VAT only']
const COLORS = ['#2F50E1', '#0F766E', '#B42318', '#7C3AED', '#111111']
const FONTS = ['Open Sans', 'Inter', 'Georgia', 'Roboto Mono']

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

const NONE = { inv: false, quo: false, brand: false, pay: false }
const ALL = { inv: true, quo: true, brand: true, pay: true }

export default function TemplateWizard({ draft: initial, mode = 'create', start = 'general', onSave, onClose, onDirty }) {
  const edit = mode === 'edit'
  const [d, setD] = useState(initial)
  const [orig] = useState(() => clone(initial))
  const [pick, setPick] = useState(() => (edit ? { ...ALL, ...initial.picks } : NONE))
  const [origPick] = useState(pick)
  const [step, setStep] = useState(edit ? start : 'pick') // 'pick' = the customise screen before the step list
  const [seen, setSeen] = useState(() => new Set()) // create: steps already filled in get a check
  const [err, setErr] = useState(false)
  const nameRef = useRef(null)
  const bodyRef = useRef(null)
  const id = useId()

  const set = (path, v) =>
    setD((x) => {
      const n = clone(x)
      setP(n, path, v)
      return n
    })
  const dirty = JSON.stringify(d) !== JSON.stringify(orig) || JSON.stringify(pick) !== JSON.stringify(origPick)
  useEffect(() => {
    onDirty(dirty)
  }, [dirty])

  // Steps in the sidebar: General, then whatever was picked, in a fixed order. The pick screen comes before them all.
  const steps = STEPS.filter(([k]) => k === 'general' || pick[k])
  const active = steps.map(([k]) => k)
  const at = active.indexOf(step) // -1 on the pick screen
  const next = active[at + 1]
  const done = (k) => !edit && k !== step && seen.has(k)

  const go = (k) => {
    if (step !== 'pick') setSeen((x) => new Set(x).add(step))
    setStep(k)
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }
  const nameOk = () => {
    if (d.name.trim()) return true
    setErr(true)
    go('general')
    setTimeout(() => nameRef.current?.focus(), 0)
    return false
  }
  const finish = (asDraft) => {
    if (!nameOk()) return
    const out = clone(d)
    out.picks = pick
    if (!pick.brand) delete out.brand
    onSave(out, asDraft)
  }
  const cont = () => {
    if (step === 'general' && !nameOk()) return
    if (next) go(next)
    else finish(false)
  }
  const back = () => (at > 0 ? go(active[at - 1]) : at === 0 ? go('pick') : onClose())

  const pv = step === 'quo' ? 'quo' : 'inv'
  const cols = d.inv.cols
  const totals = cols.totalEx && cols.totalInc ? TOTALS[0] : cols.totalEx ? TOTALS[1] : TOTALS[2]
  const setTotals = (v) => {
    set('inv.cols.totalEx', v !== TOTALS[2])
    set('inv.cols.totalInc', v !== TOTALS[1])
  }
  const tog = (label, path, v) => (
    <div className="trow" key={path}>
      <span>{label}</span>
      <Sw checked={v} onChange={(x) => set(path, x)} />
    </div>
  )
  const card = ([k, label]) => (
    <label key={k} className={'wz-doc' + (pick[k] ? ' on' : '')}>
      <input type="checkbox" checked={pick[k]} onChange={(e) => setPick((p) => ({ ...p, [k]: e.target.checked }))} />
      <span className="wz-box" aria-hidden="true">{pick[k] && CHECK}</span>
      <span className="wz-doc-l">{label}</span>
    </label>
  )

  const pages = {
    general: (
      <>
        <div className="wz-f">
          <label className="fl" htmlFor={id + 'n'}>Template name</label>
          <input
            ref={nameRef}
            id={id + 'n'}
            className={'inp' + (err ? ' err' : '')}
            placeholder="Type"
            value={d.name}
            maxLength={60}
            autoComplete="off"
            onChange={(e) => {
              set('name', e.target.value)
              if (e.target.value.trim()) setErr(false)
            }}
          />
          {err && <div className="errt">Enter a template name</div>}
        </div>
        <div className="pgrid">
          <div className="wz-f">
            <span className="fl" id={id + 'l'}>Language</span>
            <FlagSelect value={d.presets.language} opts={LANGUAGES} onChange={(v) => set('presets.language', v)} labelledBy={id + 'l'} />
          </div>
          <div className="wz-f">
            <span className="fl" id={id + 'c'}>Currency</span>
            <FlagSelect value={d.presets.currency} opts={CURRENCIES} onChange={(v) => set('presets.currency', v)} labelledBy={id + 'c'} />
          </div>
        </div>
        <div className="wz-f">
          <label className="fl" htmlFor={id + 'i'}>Item type</label>
          <select className="sel" id={id + 'i'} value={d.presets.itemType} onChange={(e) => set('presets.itemType', e.target.value)}>
            {ITEM_TYPES.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </>
    ),
    pick: (
      <div className="wz-pick">
        <div className="wz-q">
          <b>What should this template change?</b>
          <span>Anything you don’t pick keeps your default settings.</span>
        </div>
        <div className="wz-docs">{PICKS.map(card)}</div>
      </div>
    ),
    inv: (
      <>
        <div className="wz-f">
          <label className="fl" htmlFor={id + 't'}>Document title</label>
          <input className="inp" id={id + 't'} value={d.inv.title} maxLength={40} onChange={(e) => set('inv.title', e.target.value)} />
        </div>
        <div className="wz-f">
          <span className="fl">Item columns</span>
          <div className="wz-list">
            {tog('Date', 'inv.cols.date', cols.date)}
            {tog('Quantity', 'inv.cols.qty', cols.qty)}
            {tog('Unit', 'inv.cols.unit', cols.unit)}
            {tog('Unit price', 'inv.cols.price', cols.price)}
            {tog('VAT', 'inv.cols.vat', cols.vat)}
          </div>
        </div>
        <div className="wz-f">
          <label className="fl" htmlFor={id + 'to'}>Totals</label>
          <select className="sel" id={id + 'to'} value={totals} onChange={(e) => setTotals(e.target.value)}>
            {TOTALS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="wz-f">
          <span className="fl">Reference fields</span>
          <div className="wz-list">
            {tog('Buyer’s PO number', 'inv.refs.po', d.inv.refs.po)}
            {tog('Buyer’s reference number', 'inv.refs.ref', d.inv.refs.ref)}
            {tog('Customer ID', 'inv.refs.cust', d.inv.refs.cust)}
          </div>
        </div>
      </>
    ),
    quo: (
      <div className="wz-rows">
        <label htmlFor={id + 'qt'}>Title</label>
        <input className="inp" id={id + 'qt'} value={d.quo.title} maxLength={40} onChange={(e) => set('quo.title', e.target.value)} />
        <span>Default quote validity</span>
        <div>
          <Sw checked={d.quo.validOn} onChange={(v) => set('quo.validOn', v)} />
          {d.quo.validOn && (
            <select className="sel" aria-label="Quote validity" value={d.quo.valid} onChange={(e) => set('quo.valid', e.target.value)}>
              {['14 days', '30 days', '60 days'].map((o) => <option key={o}>{o}</option>)}
            </select>
          )}
        </div>
        <span>Use the same defaults as for the invoice</span>
        <div>
          <Sw checked={d.quo.same} onChange={(v) => set('quo.same', v)} />
        </div>
      </div>
    ),
    brand: (
      <>
        <div className="wz-f">
          <span className="fl" id={id + 'bc'}>Brand colour</span>
          <div className="wz-sw" role="radiogroup" aria-labelledby={id + 'bc'}>
            {COLORS.map((c) => (
              <button key={c} role="radio" aria-checked={d.brand.color === c} aria-label={c} style={{ '--c': c }} onClick={() => set('brand.color', c)} />
            ))}
          </div>
        </div>
        <div className="wz-f">
          <label className="fl" htmlFor={id + 'bf'}>Font</label>
          <select className="sel" id={id + 'bf'} value={d.brand.font} onChange={(e) => set('brand.font', e.target.value)}>
            {FONTS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </>
    ),
    pay: (
      <>
        <div className="wz-f">
          <label className="fl" htmlFor={id + 'pt'}>Payment terms</label>
          <select className="sel" id={id + 'pt'} value={d.presets.terms} onChange={(e) => set('presets.terms', e.target.value)}>
            {PAYMENT_TERMS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="wz-f">
          <span className="fl">Reminders</span>
          <div className="wz-list">
            {tog('Before the due date', 'remind.before', d.remind.before)}
            {tog('On the due date', 'remind.on', d.remind.on)}
            {tog('7 days after the due date', 'remind.after', d.remind.after)}
          </div>
        </div>
      </>
    ),
  }

  return (
    <>
      <nav className={'wz-nav' + (edit ? ' in' : '')} aria-label="Steps" inert={step === 'pick'}>
        <ol>
          {steps.map(([k, label], n) => {
            const st = k === step ? 'cur' : done(k) ? 'done' : 'todo'
            return (
              <li key={k}>
                <button className={'wz-st ' + st} onClick={() => k !== step && go(k)} aria-current={st === 'cur' ? 'step' : undefined}>
                  <span className="wz-n">{st === 'done' ? CHECK : n + 1}</span>
                  <span>{label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
      <div className={'wz-main' + (step === 'pick' ? ' pick' : '')}>
        <header className="wz-head">
          <h2>{edit ? orig.name : 'New template'}</h2>
          <button className="lv-x" onClick={onClose} aria-label="Close">
            {ICONS.close()}
          </button>
        </header>
        <div className="wz-body">
          <div className="wz-form" ref={bodyRef} key={step}>
            {pages[step]}
          </div>
          <aside className="i3-pv" aria-label="Preview">
            <Paper s={eff(d, pv)} brand={pick.brand ? d.brand : undefined} />
          </aside>
        </div>
        <footer className="wz-foot">
          {edit ? (
            <>
              <button className="btn wh ic-out" onClick={onClose}>Cancel</button>
              {orig.draft && <button className="btn wh ic-out" onClick={() => finish(true)}>Save as draft</button>}
              <button className="btn dark" onClick={() => finish(false)}>{orig.draft ? 'Create' : 'Save changes'}</button>
            </>
          ) : (
            <>
              <button className="btn wh ic-out" onClick={back}>Back</button>
              <button className="btn wh ic-out" onClick={() => finish(true)}>Save as draft</button>
              <button className="btn dark" onClick={cont}>{next ? 'Continue' : 'Create'}</button>
            </>
          )}
        </footer>
      </div>
    </>
  )
}

/** Fields the wizard edits that the tabbed editor doesn't have yet. */
export function wizardDraft(t) {
  return {
    ...clone(t),
    brand: t.brand ? clone(t.brand) : { font: 'Open Sans', color: '#2F50E1', apply: { header: true, columnHeaders: true, lines: true, total: true } },
    remind: t.remind ? clone(t.remind) : { before: true, on: true, after: false },
  }
}
