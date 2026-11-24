import { useEffect, useRef, useState } from 'react'
import ListLayout from '../ListLayout.jsx'
import Paper from '../Paper.jsx'
import Icon, { ICONS } from '../Icon.jsx'
import { eff, newTpl } from '../data.js'
import '../proto/idea3/idea3.css'
import './invoice.css'

const PV = eff(newTpl('Default template', true), 'inv')
const money = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const STATES = {
  draft: { label: 'Draft', title: 'Invoice' },
  unpaid: { label: 'Unpaid', title: 'Invoice' },
  overdue: { label: 'Overdue', title: 'Invoice' },
  paid: { label: 'Paid', title: 'Invoice' },
  credit: { label: 'Credit note', title: 'Credit note' },
  cancelled: { label: 'Cancelled', title: 'Invoice' },
}

const HISTORY = {
  draft: [['Draft saved', 'now']],
  unpaid: [['Invoice created', '23/11/2026 · 14:52']],
  overdue: [['Reminder due', '04/12/2026'], ['Invoice created', '23/11/2026 · 14:52']],
  paid: [['Payment registered', '24/11/2026 · 09:10'], ['Invoice created', '23/11/2026 · 14:52']],
  credit: [['Credit note created', '16/10/2026 · 13:39']],
  cancelled: [['Invoice cancelled', '25/11/2026 · 11:02'], ['Invoice created', '23/11/2026 · 14:52']],
}

const SHARE = <Icon d="M12 15V4M8 8l4-4 4 4M5 14v5h14v-5" />
const DOTS = <Icon d="M5 12h.01M12 12h.01M19 12h.01" />

/** Invoice page after finalising (or opening one from the list). Layout follows the selected variant; the state changes what the page shows. */
export default function InvoiceView({ L, inv, toast, onClose }) {
  const [st, setSt] = useState(inv.state)
  const na = () => toast('Not part of this prototype')
  const label = inv.no === '—' ? STATES[st].title : `${STATES[st].title} - ${inv.no}`
  const credit = st === 'credit'
  const settled = st === 'paid' || credit
  const gross = inv.amount

  const act = {
    draft: [['Edit', na], ['Finalise', () => { setSt('unpaid'); toast('Invoice finalised') }, true]],
    unpaid: [['Share', na, false, SHARE], ['Register payment', () => { setSt('paid'); toast('Payment registered') }, true]],
    overdue: [['Share', na, false, SHARE], ['Register payment', () => { setSt('paid'); toast('Payment registered') }, true]],
    paid: [['Share', na, false, SHARE], ['Create credit note', na, true]],
    credit: [['Share', na, true, SHARE]],
    cancelled: [['Share', na, false, SHARE], ['Duplicate', na, true]],
  }[st]
  const actions = (
    <>
      <button className="icon-btn" onClick={na} aria-label="More actions">{DOTS}</button>
      {act.map(([t, fn, primary, icon]) => (
        <button key={t} className={'btn' + (primary ? ' dark' : ' wh ic-out')} onClick={fn}>
          {icon}{t}
        </button>
      ))}
    </>
  )

  const latest = useRef()
  latest.current = onClose
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && latest.current()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [])

  const badge = <span className={'iv-badge ' + st}>{STATES[st].label}</span>
  const body = (
    <div className="icf">
      <section className="icf-card iv-status">
        <div className="iv-grid">
          <div>{badge}</div>
          <div>
            <small>{credit ? 'Date' : st === 'draft' ? 'Not issued' : 'Due'}</small>
            <span>{st === 'draft' ? '—' : credit ? inv.date : inv.due}</span>
          </div>
          <div className="iv-bal">
            <small>{credit ? 'Refund' : 'Balance'}</small>
            <b className={st === 'overdue' ? 'od' : settled || st === 'cancelled' ? 'mu' : ''}>
              {st === 'cancelled' ? <s>{money(gross)}</s> : settled ? '0,00' : money(gross)}
            </b>
          </div>
        </div>
        {st === 'overdue' && (
          <div className="iv-note od">
            <span>12 days overdue</span>
            <button className="btn sm" onClick={na}>Send reminder</button>
          </div>
        )}
        {st === 'paid' && <div className="iv-note"><span>24/11/2026 · Bank transfer</span><span>{money(gross)} EUR</span></div>}
        {st === 'draft' && <div className="iv-note"><span>Finalise to lock the number and send it.</span></div>}
      </section>

      <section className="icf-card iv-det">
        {credit && <div><small>Related to</small><a href="#r" onClick={(e) => e.preventDefault()}>Invoice - 2</a></div>}
        <div><small>Customer</small><a href="#c" onClick={(e) => e.preventDefault()}>{inv.client}</a></div>
        <div><small>Created</small><b>{inv.date}</b></div>
        <div><small>Ledger entry number</small><b>—</b></div>
      </section>

      <section className="icf-card">
        <h3 className="icf-h">History</h3>
        <ul className="iv-hist">
          {HISTORY[st].map(([t, w]) => (
            <li key={t}><i /><div><span>{t}</span><small>{w}</small></div></li>
          ))}
        </ul>
      </section>
    </div>
  )
  const preview = <Paper s={{ ...PV, title: label }} />

  return (
    <>
      {L.flow === 'i3' ? (
        <div className={'i3 full' + (L.fit ? ' fit' : '') + (L.lumen ? ' lm' : '') + (L.viewNav ? ' kn' : '')} role="dialog" aria-modal="true" aria-label={label}>
          <aside className="i3-nav" aria-hidden="true" />
          <div className="i3-main">
            <header className="i3-head ed">
              <h2>
                <button className="back" onClick={onClose} aria-label="Back to invoices">{ICONS.back()}</button>
                <span className="i3-title">{label}</span>
              </h2>
              <div className="i3-acts">{actions}</div>
            </header>
            <div className="i3-body">
              <div className="i3-left">{body}</div>
              <aside className="i3-pv" aria-label="Preview">{preview}</aside>
            </div>
          </div>
        </div>
      ) : (
        <div className={'modal focus' + (L.viewNav ? ' kn' : '')} role="dialog" aria-modal="true" aria-label={label}>
          <aside className="snav" aria-hidden="true" />
          <section className="mcol">
            <ListLayout title={label} onBack={onClose} backLabel="Back to invoices" preview={preview} footer={actions}>
              {body}
            </ListLayout>
          </section>
        </div>
      )}
    </>
  )
}
