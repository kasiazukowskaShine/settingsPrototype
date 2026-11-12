import { useEffect, useRef } from 'react'
import Paper from '../../Paper.jsx'
import Icon, { ICONS } from '../../Icon.jsx'
import { Sw, Fld } from '../../TemplateEditor.jsx'
import { eff, getP } from '../../data.js'

const TOTALS = ['Total', 'Total excl. VAT', 'Total incl. VAT']

function Select({ id, value, opts, onChange }) {
  return (
    <select id={id} className="sel" value={value} onChange={(e) => onChange(e.target.value)}>
      {opts.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

function Text({ label, path, draft, set, max, rows }) {
  const v = getP(draft, path) || ''
  return (
    <>
      <span className="fl">{label}</span>
      <textarea className="ta" rows={rows || 2} maxLength={max} value={v} onChange={(e) => set(path, e.target.value)} />
      <div className={'cnt' + (v.length >= max ? ' max' : '')}>
        {String(v.length).padStart(2, '0')}/{max}
      </div>
    </>
  )
}

/** Template editor for a single document type: one flat form, no tabs. */
export default function DocEditor({ E, dirty, canDelete, title, defaults, onCreate, set, onBack, onSave, onDelete, brand, presets }) {
  const { type: p, draft, orig, mode } = E
  const d = draft[p]
  const create = mode === 'create'
  const lock = draft.isDef && orig.isDef
  const nameRef = useRef(null)

  useEffect(() => {
    if (create && nameRef.current) nameRef.current.focus()
  }, [create])

  const tog = (label, path) => (
    <div className="trow">
      <span>{label}</span>
      <Sw checked={getP(draft, path)} onChange={(v) => set(path, v)} />
    </div>
  )

  const totals = d.cols.totalEx && d.cols.totalInc ? 'Total' : d.cols.totalEx ? 'Total excl. VAT' : d.cols.totalInc ? 'Total incl. VAT' : 'Total'
  const setTotals = (v) => {
    set(p + '.cols.totalEx', v !== 'Total incl. VAT')
    set(p + '.cols.totalInc', v !== 'Total excl. VAT')
  }

  return (
    <>
      {defaults ? (
        <div className="ehead split">
          <h2>{title}</h2>
          <button className="btn" onClick={onCreate} style={{ marginRight: 56 }}>
            {ICONS.plus()}Create template
          </button>
        </div>
      ) : (
        <div className="ehead">
          <h2>
            <button className="back" onClick={onBack} aria-label={`Back to ${title}`}>
              {ICONS.back()}
            </button>
            <span className="idea-title">
              {title} &gt; {create ? 'Create a template' : orig.name}
            </span>
          </h2>
        </div>
      )}
      <div className="egrid idea-grid">
        <div>
          {!defaults && (
            <>
              <Fld id="default">
                <div className="trow" style={{ padding: 0 }}>
                  <span style={{ fontWeight: 500 }}>Default</span>
                  <Sw checked={draft.isDef} disabled={lock} onChange={(v) => set('isDef', v)} />
                </div>
                {lock && <div className="help">This is your default template. Set another template as default to change it.</div>}
              </Fld>
              <Fld id="name">
                <label className="fl" htmlFor="dn">
                  Template name
                </label>
                <input ref={nameRef} id="dn" className="inp" placeholder="Type" value={draft.name} maxLength={60} autoComplete="off" onChange={(e) => set('name', e.target.value)} />
              </Fld>
            </>
          )}
          <Fld id="title">
            <label className="fl" htmlFor="dt">
              Document title
            </label>
            <input id="dt" className="inp" value={d.title} maxLength={40} onChange={(e) => set(p + '.title', e.target.value)} />
          </Fld>
          {p === 'quo' && (
            <Fld id="valid">
              <div className="trow" style={{ padding: 0 }}>
                <span className="fl" style={{ margin: 0 }}>
                  Default quote validity
                </span>
                <Sw checked={d.validOn} onChange={(v) => set('quo.validOn', v)} />
              </div>
              {d.validOn && (
                <div style={{ marginTop: 12 }}>
                  <Select value={d.valid} opts={['14 days', '30 days', '60 days']} onChange={(v) => set('quo.valid', v)} />
                </div>
              )}
            </Fld>
          )}
          <Fld id="cols">
            <span className="fl">Item columns</span>
            <div className="box">
              {tog('Date', p + '.cols.date')}
              {tog('Quantity', p + '.cols.qty')}
              {tog('Unit', p + '.cols.unit')}
              {tog('Unit price', p + '.cols.price')}
              {tog('VAT', p + '.cols.vat')}
            </div>
          </Fld>
          <Fld id="totals">
            <label className="fl" htmlFor="dtot">
              Totals
            </label>
            <Select id="dtot" value={totals} opts={TOTALS} onChange={setTotals} />
          </Fld>
          <Fld id="refs">
            <span className="fl">Reference fields</span>
            <div className="box">
              {tog('Buyer’s PO number', p + '.refs.po')}
              {tog('Buyer’s reference number', p + '.refs.ref')}
              {tog('Customer ID', p + '.refs.cust')}
            </div>
          </Fld>
          <Fld id="disc">
            <span className="fl">Discounts</span>
            <div className="two">
              <Select value={d.discLevel} opts={['None', 'Per line', 'On total']} onChange={(v) => set(p + '.discLevel', v)} />
              {d.discLevel !== 'None' && <Select value={d.discType} opts={['Percentage (%)', 'Amount (€)']} onChange={(v) => set(p + '.discType', v)} />}
            </div>
          </Fld>
          <Fld id="message">
            <Text label="Default message" path={p + '.message'} draft={draft} set={set} max={250} />
          </Fld>
          <Fld id="footer">
            <Text label="Footer note" path={p + '.footer'} draft={draft} set={set} max={250} />
          </Fld>
          <Fld id="tc">
            <div className="trow" style={{ padding: 0 }}>
              <span className="fl" style={{ margin: 0 }}>
                Terms and Conditions
              </span>
              <Sw checked={d.tcOn} onChange={(v) => set(p + '.tcOn', v)} />
            </div>
            {d.tcOn && (
              <div className="box" style={{ marginTop: 12, padding: '16px 18px' }}>
                <textarea className="ta" rows={3} maxLength={250} placeholder="Type" style={{ minHeight: 92 }} value={d.tc || ''} onChange={(e) => set(p + '.tc', e.target.value)} />
                <div className={'cnt' + ((d.tc || '').length >= 250 ? ' max' : '')}>{String((d.tc || '').length).padStart(2, '0')}/250</div>
              </div>
            )}
          </Fld>
        </div>
        <aside className="pvp ed">
          <div className="pvh">
            <span>Live preview</span>
          </div>
          <Paper s={eff({ ...draft, presets }, p)} brand={brand} />
        </aside>
      </div>
      <div className="efoot">
        <div className="bt">
          {!defaults && (
            <button className="btn del" onClick={onDelete} disabled={!canDelete} title={canDelete ? undefined : 'You need at least one template'}>
              <Icon>
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </Icon>
              Delete
            </button>
          )}
          <button className="btn dark" onClick={onSave} disabled={!dirty || !draft.name.trim()}>
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}
