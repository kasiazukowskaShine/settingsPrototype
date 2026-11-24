import Icon, { ICONS } from '../Icon.jsx'

export const SUPPLIERS = ['DB Fernverkehr AG', 'Atelier Dumontel', 'Nova Consulting', 'Green Loop SAS']
const CATS = ['Travel', 'Meals', 'Software', 'Office supplies']
const VATS = ['0 %', '7 %', '19 %', '21 %']
const DESCS = ['Train ticket', 'Lunch', 'Furniture', 'Subscription']
const num = (s) => parseFloat(String(s).replace(',', '.')) || 0
export const fmt = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const blank = () => ({ desc: '', cat: '', amount: '', vat: '' })
const vatOf = (l) => (l.vat ? num(l.amount) - num(l.amount) / (1 + num(l.vat) / 100) : 0)

export function newPurchase() {
  return {
    ref: '1',
    supplier: '',
    date: '01/01/2026',
    dueOn: false,
    due: '01/02/2026',
    lines: [],
    entry: blank(),
  }
}

export function totals(d) {
  let incl = 0
  let vat = 0
  d.lines.forEach((l) => {
    incl += num(l.amount)
    vat += vatOf(l)
  })
  return { incl, vat, excl: incl - vat }
}

function Sel({ value, opts, onChange, placeholder, id, err }) {
  return (
    <div className="icf-sel">
      <select id={id} className={'sel' + (value ? '' : ' ph') + (err ? ' err' : '')} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      {ICONS.chevDown('ch')}
    </div>
  )
}

const Cal = () => (
  <Icon>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </Icon>
)

/** The Add a purchase form from Figma: reference/supplier/dates, one or more lines, and a total bar. */
export default function PurchaseForm({ d, set, err, toast }) {
  const t = totals(d)
  const e = d.entry
  const setE = (k, v) => set('entry', { ...e, [k]: v })
  const add = () => {
    if (!e.desc || num(e.amount) <= 0) return toast('Add a description and an amount first')
    set('lines', [...d.lines, e])
    set('entry', blank())
  }
  return (
    <div className="icf pf">
      <section className="icf-card">
        <div className="pf-info">
          <Icon>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </Icon>
          <p>We automatically extract some information, approve the purchase to validate the suggestions.</p>
        </div>
        <div className="icf-two">
          <div>
            <label className="icf-l" htmlFor="pf-ref">Reference number</label>
            <input id="pf-ref" className="inp" value={d.ref} onChange={(e) => set('ref', e.target.value)} />
          </div>
          <div>
            <label className="icf-l" htmlFor="pf-sup">Supplier *</label>
            <Sel id="pf-sup" value={d.supplier} opts={SUPPLIERS} placeholder="Select a supplier" err={err} onChange={(v) => set('supplier', v)} />
            {err && <div className="pf-err">Choose a supplier to add this purchase.</div>}
          </div>
        </div>
        <div className="icf-two pf-dates">
          <div>
            <label className="icf-l" htmlFor="pf-date">Receipt date</label>
            <div className="icf-date">
              <input id="pf-date" className="inp" value={d.date} onChange={(e) => set('date', e.target.value)} />
              <Cal />
            </div>
          </div>
          {d.dueOn ? (
            <div>
              <label className="icf-l" htmlFor="pf-due">Due date</label>
              <div className="icf-date">
                <input id="pf-due" className="inp" value={d.due} onChange={(e) => set('due', e.target.value)} />
                <Cal />
              </div>
            </div>
          ) : (
            <button type="button" className="pf-add" onClick={() => set('dueOn', true)}>
              {ICONS.plus()}Add due date
            </button>
          )}
        </div>

        {d.lines.length > 0 && (
        <ul className="icf-items pf-lines">
          {d.lines.map((l, i) => (
            <li key={i}>
              <div className="icf-row">
                <b>{l.desc}</b>
                <b>{fmt(num(l.amount))} EUR</b>
              </div>
              <div className="icf-row">
                <span>{l.cat || 'No category'}</span>
                <button className="icf-ico pf-del" aria-label={`Delete ${l.desc}`} onClick={() => set('lines', d.lines.filter((_, j) => j !== i))}>
                  <Icon d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </button>
              </div>
              <div className="icf-tags">
                <span className="icf-tag">{l.vat ? `VAT ${l.vat.replace(' ', '')}` : 'No VAT'}</span>
                <span className="icf-tag">VAT {fmt(vatOf(l))} EUR</span>
              </div>
            </li>
          ))}
        </ul>
        )}
        {d.lines.length === 0 && <p className="icf-empty">No lines yet. Add the first one below.</p>}
        <div className="icf-two pf-entry">
          <div>
            <label className="icf-l" htmlFor="pf-d">Description</label>
            <Sel id="pf-d" value={e.desc} opts={DESCS} placeholder="E.g. furnitures, lunch" onChange={(v) => setE('desc', v)} />
          </div>
          <div>
            <label className="icf-l" htmlFor="pf-c">Purchase category</label>
            <Sel id="pf-c" value={e.cat} opts={CATS} placeholder="Select category" onChange={(v) => setE('cat', v)} />
          </div>
        </div>
        <div className="pf-amt">
          <div>
            <label className="icf-l" htmlFor="pf-a">Amount (incl. VAT)</label>
            <div className="pf-money">
              <input id="pf-a" className="inp r" placeholder="0.00" inputMode="decimal" value={e.amount} onChange={(ev) => setE('amount', ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && add()} />
              <span>EUR{ICONS.chevDown('ch')}</span>
            </div>
          </div>
          <div>
            <label className="icf-l" htmlFor="pf-v">VAT rate</label>
            <Sel id="pf-v" value={e.vat} opts={VATS} placeholder="Select" onChange={(v) => setE('vat', v)} />
          </div>
          <div>
            <label className="icf-l">VAT amount</label>
            <input className="inp ro" readOnly aria-label="VAT amount" value={fmt(vatOf(e)) + ' EUR'} />
          </div>
        </div>
        <button type="button" className="btn icf-add" onClick={add}>
          {ICONS.plus()}Add line{ICONS.chevDown('ch')}
        </button>
      </section>

      <section className="icf-card pf-total">
        <b>Total</b>
        <div><small>Incl. VAT</small><span>{fmt(t.incl)} EUR</span></div>
        <div><small>VAT amount</small><span>{fmt(t.vat)} EUR</span></div>
        <div><small>Excl. VAT</small><span>{fmt(t.excl)} EUR</span></div>
      </section>
    </div>
  )
}
