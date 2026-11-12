import { useEffect, useRef, useState } from 'react'
import Paper from './Paper.jsx'
import GeneralPresets from './GeneralPresets.jsx'
import ListLayout from './ListLayout.jsx'
import Icon, { ICONS } from './Icon.jsx'
import { TYL, eff, getP } from './data.js'

export function Sw({ checked, onChange, disabled }) {
  return (
    <label className="sw">
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  )
}

export function Fld({ id, hl, children }) {
  return (
    <div className={'fld' + (hl === id ? ' hl' : '')} id={'f-' + id}>
      {children}
    </div>
  )
}

function Select({ value, opts, onChange, disabled }) {
  return (
    <select className="sel" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {opts.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

function Counter({ len, max, style }) {
  return (
    <div className={'cnt' + (len >= max ? ' max' : '')} style={style}>
      {String(len).padStart(2, '0')}/{max}
    </div>
  )
}

function SharedFields({ p, draft, set, hl, onPaste }) {
  const d = draft[p]
  const other = p === 'inv' ? 'quotes' : 'invoices'
  const tog = (label, path) => (
    <div className="trow">
      <span>{label}</span>
      <Sw checked={getP(draft, path)} onChange={(v) => set(path, v)} />
    </div>
  )
  const msg = d.message || ''
  const foot = d.footer || ''
  const tc = d.tc || ''
  return (
    <>
      <h3 className="sec first">Line items</h3>
      <Fld id={p + '-cols'} hl={hl}>
        <span className="fl">Item columns</span>
        <div className="box">
          {tog('Date', p + '.cols.date')}
          {tog('Quantity', p + '.cols.qty')}
          {tog('Unit', p + '.cols.unit')}
          {tog('Unit price', p + '.cols.price')}
          {tog('VAT', p + '.cols.vat')}
          {tog('Total excluding VAT', p + '.cols.totalEx')}
          {tog('Total including VAT', p + '.cols.totalInc')}
        </div>
      </Fld>
      <h3 className="sec">References</h3>
      <Fld id={p + '-refs'} hl={hl}>
        <span className="fl">Reference fields</span>
        <div className="box">
          {tog('Buyer’s PO number', p + '.refs.po')}
          {tog('Buyer’s reference number', p + '.refs.ref')}
          {tog('Customer ID', p + '.refs.cust')}
        </div>
      </Fld>
      <Fld id={p + '-disc'} hl={hl}>
        <span className="fl">Discounts</span>
        <div className="two">
          <Select value={d.discLevel} opts={['None', 'Per line', 'On total']} onChange={(v) => set(p + '.discLevel', v)} />
          {d.discLevel !== 'None' && <Select value={d.discType} opts={['Percentage (%)', 'Amount (€)']} onChange={(v) => set(p + '.discType', v)} />}
        </div>
      </Fld>
      <h3 className="sec">Content</h3>
      <Fld id={p + '-message'} hl={hl}>
        <span className="fl">Default message</span>
        <textarea className="ta" rows={2} maxLength={250} value={msg} onChange={(e) => set(p + '.message', e.target.value)} />
        <Counter len={msg.length} max={250} />
      </Fld>
      <Fld id={p + '-footer'} hl={hl}>
        <span className="fl">Footer note</span>
        <textarea className="ta" rows={2} maxLength={250} value={foot} onChange={(e) => set(p + '.footer', e.target.value)} />
        <Counter len={foot.length} max={250} />
      </Fld>
      <Fld id={p + '-tc'} hl={hl}>
        <div className="trow" style={{ padding: 0 }}>
          <span className="fl" style={{ margin: 0 }}>
            Terms and Conditions
          </span>
          <Sw checked={d.tcOn} onChange={(v) => set(p + '.tcOn', v)} />
        </div>
        {d.tcOn && (
          <div className="box" style={{ marginTop: 12, padding: '16px 18px' }}>
            <textarea
              className="ta"
              rows={3}
              maxLength={250}
              placeholder="Type"
              style={{ minHeight: 92 }}
              value={tc}
              onChange={(e) => set(p + '.tc', e.target.value)}
            />
            <div className="tcf">
              <Counter len={tc.length} max={250} style={{ margin: 0 }} />
              <button className="btn sm wh" onClick={() => onPaste(p)}>
                <Icon>
                  <rect x="5" y="4" width="14" height="17" rx="2" />
                  <path d="M9 4h6v3H9zM9 14h6M13 11l3 3-3 3" />
                </Icon>
                Paste from {other}
              </button>
            </div>
          </div>
        )}
      </Fld>
    </>
  )
}

export function Form({ E, set, hl, onPaste, nameRef }) {
  const t = E.draft
  if (E.tab === 'general') {
    const lock = t.isDef && E.orig.isDef
    return (
      <>
        <Fld id="name" hl={hl}>
          <label className="fl" htmlFor="nm">
            Template name
          </label>
          <input
            ref={nameRef}
            className={'inp' + (E.err ? ' err' : '')}
            id="nm"
            placeholder="Type"
            value={t.name}
            maxLength={60}
            autoComplete="off"
            onChange={(e) => set('name', e.target.value)}
          />
          {E.err && <div className="errt">Enter a template name</div>}
        </Fld>
        <Fld id="default" hl={hl}>
          <div className="trow" style={{ padding: 0 }}>
            <span style={{ fontWeight: 500 }}>Set as default</span>
            <Sw checked={t.isDef} disabled={lock} onChange={(v) => set('isDef', v)} />
          </div>
          <div className="help">
            {lock ? 'This is your default template. Set another template as default to change it.' : 'New invoices and quotes start from your default template.'}
          </div>
        </Fld>
        <GeneralPresets t={t} set={set} hl={hl} Fld={Fld} />
      </>
    )
  }
  if (E.tab === 'inv') {
    return (
      <>
        <Fld id="inv-title" hl={hl}>
          <label className="fl" htmlFor="it">
            Document title
          </label>
          <input className="inp" id="it" value={t.inv.title} maxLength={40} onChange={(e) => set('inv.title', e.target.value)} />
        </Fld>
        <SharedFields p="inv" draft={t} set={set} hl={hl} onPaste={onPaste} />
        <Fld id="approval" hl={hl}>
          <div className="trow" style={{ padding: 0 }}>
            <span className="fl" style={{ margin: 0 }}>
              Show message “Review before approving”
            </span>
            <Sw checked={t.inv.approval} onChange={(v) => set('inv.approval', v)} />
          </div>
        </Fld>
      </>
    )
  }
  return (
    <>
      <Fld id="quo-title" hl={hl}>
        <label className="fl" htmlFor="qt">
          Document title
        </label>
        <input className="inp" id="qt" value={t.quo.title} maxLength={40} onChange={(e) => set('quo.title', e.target.value)} />
      </Fld>
      <Fld id="valid" hl={hl}>
        <div className="trow" style={{ padding: 0 }}>
          <span className="fl" style={{ margin: 0 }}>
            Default quote validity
          </span>
          <Sw checked={t.quo.validOn} onChange={(v) => set('quo.validOn', v)} />
        </div>
        {t.quo.validOn && (
          <div style={{ marginTop: 12 }}>
            <Select value={t.quo.valid} opts={['14 days', '30 days', '60 days']} onChange={(v) => set('quo.valid', v)} />
          </div>
        )}
      </Fld>
      <Fld id="same" hl={hl}>
        <div className="trow" style={{ padding: 0 }}>
          <span style={{ fontWeight: 500 }}>Use the same defaults as for the invoice</span>
          <Sw checked={t.quo.same} onChange={(v) => set('quo.same', v)} />
        </div>
      </Fld>
      {!t.quo.same && <SharedFields p="quo" draft={t} set={set} hl={hl} onPaste={onPaste} />}
    </>
  )
}

export default function TemplateEditor({ E, set, setTab, setPv, onPaste, onBack, onSave, onClose, focusField }) {
  const create = E.mode === 'create'
  const [hl, setHl] = useState(null)
  const nameRef = useRef(null)

  // Scroll to and briefly highlight a field reached from settings search.
  useEffect(() => {
    if (!focusField) return
    let off
    const on = setTimeout(() => {
      const el = document.getElementById('f-' + focusField.id)
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      setHl(focusField.id)
      off = setTimeout(() => setHl(null), 1900)
    }, 60)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [focusField])

  useEffect(() => {
    if (E.err && nameRef.current) nameRef.current.focus()
  }, [E.err])

  const preview = (
    <>
      <div className="seg">
        <button className={E.pv === 'inv' ? 'on' : ''} onClick={() => setPv('inv')}>
          Invoice
        </button>
        <button className={E.pv === 'quo' ? 'on' : ''} onClick={() => setPv('quo')}>
          Quote
        </button>
      </div>
      <Paper s={eff(E.draft, E.pv)} />
    </>
  )
  const footer = (
    <>
      <button className="btn wh outline" onClick={onBack}>
        Discard
      </button>
      <button className="btn dark" onClick={onSave}>
        {create ? 'Save template' : 'Save changes'}
      </button>
    </>
  )

  return (
    <ListLayout
      title={create ? 'Create a template' : <><span className="sl">Templates /</span> {E.orig.name}</>}
      onBack={onBack}
      backLabel="Back to templates"
      preview={preview}
      onClose={onClose}
      footer={footer}
    >
      <div className="etabs">
        <div className="tabs" role="tablist">
          {['general', 'inv', 'quo'].map((k) => (
            <button key={k} className={'tab' + (E.tab === k ? ' on' : '')} role="tab" onClick={() => setTab(k)}>
              {TYL[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="lv-form" key={E.tab}>
        <Form E={E} set={set} hl={hl} onPaste={onPaste} nameRef={nameRef} />
      </div>
    </ListLayout>
  )
}
