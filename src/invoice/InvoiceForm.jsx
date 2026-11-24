import { Sw } from '../TemplateEditor.jsx'
import Icon, { ICONS } from '../Icon.jsx'

const PEOPLE = ['Maria Peterson', 'Nova Consulting', 'Atelier Dumontel', 'James Burton']
const TERMS = ['Within 30 days - due on 24/04/2025', 'Within 14 days', 'Within 60 days', 'On receipt']
const UNITS = ['Stk.', 'Hour', 'Day', 'Piece']
const VATS = ['21%', '9%', '0%']

export const eur = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ | /g, ' ') + ' EUR'
export const lineTotal = (it) => it.qty * it.price

export function newInvoice() {
  return {
    customer: 'Maria Peterson',
    issuer: 'Maria Peterson',
    issue: '18/12/2026',
    sale: '18/12/2026',
    message: 'We appreciate your trust.',
    items: [],
    entry: { title: '', date: '19/02/26', qty: '1,00', unit: 'Stk.', price: '', vat: '21%' },
    terms: TERMS[0],
    bank: true,
    paypal: true,
    footnote: '',
  }
}

function Sel({ value, opts, onChange, id }) {
  return (
    <div className="icf-sel">
      <select id={id} className="sel" value={value} onChange={(e) => onChange(e.target.value)}>
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

function DateInput({ id, value, onChange }) {
  return (
    <div className="icf-date">
      <input id={id} className="inp" value={value} onChange={(e) => onChange(e.target.value)} />
      <Cal />
    </div>
  )
}

/** The Create invoice form from Figma: customer/issuer, details, items, payment and footer as separate sections. */
export default function InvoiceForm({ d, set, toast }) {
  const total = d.items.reduce((s, it) => s + lineTotal(it), 0)
  const vat = total * 0.21
  const e = d.entry
  const setE = (k, v) => set('entry', { ...e, [k]: v })
  const num = (s) => parseFloat(String(s).replace(',', '.')) || 0
  const add = () => {
    if (!e.title.trim()) return toast('Add an item title first')
    set('items', [...d.items, { title: e.title.trim(), qty: num(e.qty), price: num(e.price), vat: e.vat }])
    set('entry', { ...e, title: '', price: '', qty: '1,00' })
  }
  const na = () => toast('Not part of this prototype')

  return (
    <div className="icf">
      <section className="icf-card">
        <div className="icf-two">
          <div>
            <label className="icf-l" htmlFor="ic-c">Customer</label>
            <Sel id="ic-c" value={d.customer} opts={PEOPLE} onChange={(v) => set('customer', v)} />
          </div>
          <div>
            <label className="icf-l" htmlFor="ic-i">Issuer</label>
            <Sel id="ic-i" value={d.issuer} opts={PEOPLE} onChange={(v) => set('issuer', v)} />
          </div>
        </div>
      </section>

      <section className="icf-card">
        <h3 className="icf-h">Invoice details</h3>
        <div className="icf-two">
          <div>
            <label className="icf-l" htmlFor="ic-d1">Issue date</label>
            <DateInput id="ic-d1" value={d.issue} onChange={(v) => set('issue', v)} />
          </div>
          <div>
            <label className="icf-l" htmlFor="ic-d2">Date of sale or service</label>
            <DateInput id="ic-d2" value={d.sale} onChange={(v) => set('sale', v)} />
          </div>
        </div>
        <label className="icf-l" htmlFor="ic-m" style={{ marginTop: 16 }}>Message</label>
        <input id="ic-m" className="inp" value={d.message} maxLength={250} onChange={(ev) => set('message', ev.target.value)} />
      </section>

      <section className="icf-card">
        <div className="icf-row">
          <h3 className="icf-h">Items</h3>
          <div className="icf-pills">
            <button className="btn sm" onClick={na}>
              <Icon><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M10 4v16M15 4v16" /></Icon>
              Columns{ICONS.chevDown('ch')}
            </button>
            <button className="btn sm" onClick={na}>
              <Icon d="M6 18L18 6M8 8h.01M16 16h.01" />
              Discounts{ICONS.chevDown('ch')}
            </button>
          </div>
        </div>
        {d.items.length > 0 && (
        <ul className="icf-items">
          {d.items.map((it, i) => (
            <li key={i}>
              <div className="icf-row">
                <b>{it.title}</b>
                <b>{eur(lineTotal(it))}</b>
              </div>
              <div>{String(it.qty).replace('.', ',')} × {eur(it.price)}</div>
              <div className="icf-tags">
                <span className="icf-tag"><Icon d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></span>
                <span className="icf-tag">VAT {it.vat}</span>
              </div>
            </li>
          ))}
        </ul>
        )}
        {d.items.length === 0 && <p className="icf-empty">No items yet. Add the first one below.</p>}
        <label className="icf-l" htmlFor="ic-t">Item title</label>
        <div className="icf-search">
          <div className="icf-date">
            <input id="ic-t" className="inp" placeholder="Type to search or create" value={e.title} onChange={(ev) => setE('title', ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && add()} />
            {ICONS.search()}
          </div>
          <div className="icf-kind"><span className="on"><Icon d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></span><span><Icon d="M14 6a4 4 0 00-5 5l-5 5 2 2 5-5a4 4 0 005-5l-2 2-2-2z" /></span></div>
        </div>
        <div className="icf-three">
          <div><label className="icf-l" htmlFor="ic-dt">Date</label><DateInput id="ic-dt" value={e.date} onChange={(v) => setE('date', v)} /></div>
          <div><label className="icf-l" htmlFor="ic-q">Quantity</label><input id="ic-q" className="inp" value={e.qty} onChange={(ev) => setE('qty', ev.target.value)} /></div>
          <div><label className="icf-l" htmlFor="ic-u">Unit type</label><Sel id="ic-u" value={e.unit} opts={UNITS} onChange={(v) => setE('unit', v)} /></div>
          <div><label className="icf-l" htmlFor="ic-p">Unit price</label><div className="icf-cur"><input id="ic-p" className="inp r" placeholder="0,00" value={e.price} onChange={(ev) => setE('price', ev.target.value)} /><span>EUR</span></div></div>
          <div><label className="icf-l" htmlFor="ic-v">VAT</label><Sel id="ic-v" value={e.vat} opts={VATS} onChange={(v) => setE('vat', v)} /></div>
          <div><label className="icf-l">Total incl. VAT</label><div className="icf-cur"><input className="inp r" readOnly aria-label="Total incl. VAT" value={eur(num(e.qty) * num(e.price) * (1 + num(e.vat) / 100)).replace(' EUR', '')} /><span>EUR</span></div></div>
        </div>
        <button className="btn icf-add" onClick={add}>{ICONS.plus()}Add item{ICONS.chevDown('ch')}</button>
        <div className="icf-total">
          <div className="icf-row"><b>Total</b><b>{eur(total)}</b></div>
          <div className="icf-sub"><span>Excl. VAT</span><span>{eur(total)}</span></div>
          <div className="icf-sub"><span>VAT 21%</span><span>{eur(vat)}</span></div>
          <div className="icf-sub"><span>Incl. VAT</span><span>{eur(total + vat)}</span></div>
        </div>
      </section>

      <section className="icf-card">
        <div className="icf-row">
          <h3 className="icf-h">Payment</h3>
          <button className="icf-ico" onClick={na} aria-label="Edit payment methods"><Icon d="M4 20h4l10-10-4-4L4 16zM13 7l4 4" /></button>
        </div>
        <label className="icf-l" htmlFor="ic-pt">Conditions for payment</label>
        <Sel id="ic-pt" value={d.terms} opts={TERMS} onChange={(v) => set('terms', v)} />
        <div className="icf-pay">
          <div><b><Icon d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />Bank transfer</b><small>Rabobank, NL91 ABNA 0417 1643 00, ABCDNL1A</small><Sw checked={d.bank} onChange={(v) => set('bank', v)} /></div>
          <div><b><Icon d="M7 20l2-14h6a4 4 0 010 8H10" />PayPal</b><small>aspi@ageras.com</small><Sw checked={d.paypal} onChange={(v) => set('paypal', v)} /></div>
        </div>
      </section>

      <section className="icf-card">
        <h3 className="icf-h">Footer</h3>
        <div className="icf-row"><label className="icf-l" htmlFor="ic-f">Footnote <span>(optional)</span></label><small className="icf-cnt">{d.footnote.length}/250</small></div>
        <input id="ic-f" className="inp" placeholder="Type a footnote…" maxLength={250} value={d.footnote} onChange={(ev) => set('footnote', ev.target.value)} />
      </section>
    </div>
  )
}
