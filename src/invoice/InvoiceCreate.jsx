import { useEffect, useRef, useState } from 'react'
import ListLayout from '../ListLayout.jsx'
import Paper from '../Paper.jsx'
import Icon, { ICONS } from '../Icon.jsx'
import { eff, newTpl } from '../data.js'
import '../proto/idea3/idea3.css'
import './invoice.css'
import InvoiceForm, { newInvoice } from './InvoiceForm.jsx'

const PV = eff(newTpl('Default template', true), 'inv')
export const GEAR = 'M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z'

/**
 * Create invoice, opened from the invoices list. The layout follows the selected variant: an 'i3' flow is the
 * split editor (header actions, form cards and preview 50/50); a 'modal' flow is the focused list layout
 * (back arrow, form on the left, preview on the right, actions in the bottom bar).
 */
export default function InvoiceCreate({ L, toast, onClose, onFinalise, onSettings, paused }) {
  const [d, setD] = useState(newInvoice)
  const [orig] = useState(newInvoice)
  const [dlg, setDlg] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [ask, setAsk] = useState(false) // approval step before finalising
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }))
  const dirty = JSON.stringify(d) !== JSON.stringify(orig)
  const leave = () => (dirty ? setDlg(true) : onClose())
  const create = (asDraft) => {
    if (asDraft) {
      toast('Draft saved.')
      return onClose()
    }
    if (leaving) return
    setAsk(true)
  }
  const approve = () => {
    setAsk(false)
    const net = d.items.reduce((s, it) => s + it.qty * it.price, 0)
    const inv = { no: '4', client: d.customer, date: '23/11/2026', due: '23/12/2026', amount: net * 1.21, state: 'unpaid' }
    // Let the form fade out (.fx-out, 160ms) before the invoice view takes over and fades its overview in.
    setLeaving(true)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(() => onFinalise(inv), reduce ? 100 : 160)
  }

  const latest = useRef()
  latest.current = { dlg, ask, leave, paused }
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || latest.current.paused) return
      if (latest.current.ask) setAsk(false)
      else if (latest.current.dlg) setDlg(null)
      else latest.current.leave()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const actions = (
    <>
      <button className="icon-btn" onClick={onSettings} aria-label="Invoice settings">
        <Icon>
          <circle cx="12" cy="12" r="3" />
          <path d={GEAR} />
        </Icon>
      </button>
      <button className="btn wh ic-out" onClick={() => create(true)}>
        Save as Draft
      </button>
      <button className="btn dark" onClick={() => create(false)}>
        Finalise{ICONS.chevDown('ch')}
      </button>
    </>
  )
  const form = <InvoiceForm d={d} set={set} toast={toast} />
  const preview = <Paper s={PV} />

  return (
    <>
      {L.flow === 'i3' ? (
        <div className={'i3 full' + (L.fit ? ' fit' : '') + (L.lumen ? ' lm' : '') + (L.keepNav ? ' kn' : '') + (leaving ? ' fx-out' : '')} role="dialog" aria-modal="true" aria-label="Create invoice">
          <aside className="i3-nav" aria-hidden="true" />
          <div className="i3-main">
            <header className="i3-head ed">
              <h2>
                <button className="back" onClick={leave} aria-label="Back to invoices">
                  {ICONS.back()}
                </button>
                <span className="i3-title">Create invoice</span>
              </h2>
              <div className="i3-acts">{actions}</div>
            </header>
            <div className="i3-body">
              <div className="i3-left">{form}</div>
              <aside className="i3-pv" aria-label="Preview">
                {preview}
              </aside>
            </div>
          </div>
        </div>
      ) : (
        <div className={'modal focus' + (L.keepNav ? ' kn' : '') + (leaving ? ' fx-out' : '')} role="dialog" aria-modal="true" aria-label="Create invoice">
          <aside className="snav" aria-hidden="true" />
          <section className="mcol">
            <ListLayout
              title="Create invoice"
              onBack={leave}
              backLabel="Back to invoices"
              preview={preview}
              footer={actions}
            >
              {form}
            </ListLayout>
          </section>
        </div>
      )}

      {ask && (
        <div className="dlg">
          <div className="bx" role="alertdialog" aria-labelledby="icapp" aria-describedby="icappd">
            <h3 id="icapp">Approve invoice?</h3>
            <p id="icappd">To finalise, you need to approve this invoice.</p>
            <div className="bt">
              <button className="btn" onClick={() => setAsk(false)}>
                Reject
              </button>
              <button className="btn dark" onClick={approve} autoFocus>
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {dlg && (
        <div className="dlg">
          <div className="bx" role="alertdialog" aria-labelledby="icdlg">
            <h3 id="icdlg">Discard changes?</h3>
            <p>Your new invoice hasn’t been saved.</p>
            <div className="bt">
              <button className="btn" onClick={() => setDlg(null)}>
                Keep editing
              </button>
              <button className="btn dark" onClick={onClose}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
