import { useLayoutEffect, useRef, useState } from 'react'
import { fmt } from './data.js'

const DATA = [
  ['Consulting services', '14/06/2026', '1,00', 'day', '1 000,00 €', '20,00 %', '1 000,00 €'],
  ['Design work', '14/06/2026', '2,00', 'day', '250,00 €', '20,00 %', '500,00 €'],
]

/** CSS variables for the brand settings (logo, font, color and which parts of the document take the color). */
function brandVars(b) {
  if (!b) return {}
  const a = b.apply
  return {
    '--pf': `"${b.font}", sans-serif`,
    '--pbh': a.header ? b.color : '#111',
    '--pbc': a.columnHeaders ? b.color : '#e6e8ec',
    '--pbct': a.columnHeaders ? '#fff' : '#111',
    '--pbl': a.lines ? `color-mix(in srgb, ${b.color} 35%, white)` : '#e6e8ec',
    '--pbt': a.total ? b.color : '#111',
  }
}

/** A4 paper preview, laid out at 380px wide and scaled to fit its wrapper. */
export default function Paper({ s, brand }) {
  const wrap = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = wrap.current
    const update = () => el.clientWidth && setScale(el.clientWidth / 380)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const q = s.kind === 'quo'
  const c = s.cols
  const heads = ['Description']
  if (c.date) heads.push('Date')
  if (c.qty) heads.push('Qty')
  if (c.unit) heads.push('Unit')
  if (c.price) heads.push('Unit price')
  if (c.vat) heads.push('VAT')
  heads.push('Amount')

  const rows = DATA.map((r) => {
    const o = [r[0]]
    if (c.date) o.push(r[1])
    if (c.qty) o.push(r[2])
    if (c.unit) o.push(r[3])
    if (c.price) o.push(r[4])
    if (c.vat) o.push(r[5])
    o.push(r[6])
    return o
  })

  const pct = s.discType.indexOf('%') > -1
  const disc = s.discLevel === 'None' ? 0 : pct ? 150 : 100
  const ht = 1500 - disc
  const vat = ht * 0.2
  const ttc = ht + vat
  const L = []
  if (disc) {
    L.push(['Subtotal', fmt(1500)])
    L.push(['Discount', pct ? '− 10,00 % · ' + fmt(disc) : '− ' + fmt(disc)])
  }
  if (c.totalEx) L.push(['Total HT', fmt(ht), !c.totalInc])
  if (c.totalEx && c.totalInc) L.push(['VAT 20,00 %', fmt(vat)])
  if (c.totalInc) L.push(['Total TTC', fmt(ttc), true])

  const refs = []
  if (s.refs.po) refs.push('PO number: PO-2291')
  if (s.refs.ref) refs.push('Reference: REF-118')
  if (s.refs.cust) refs.push('Customer ID: C-0042')
  const contactName = [s.presets.contact.first, s.presets.contact.last].filter(Boolean).join(' ')
  const sub = q ? 'Issued 06/08/2026' + (s.validOn ? ' · Valid for ' + s.valid : '') : 'Issued 06/08/2026 · Due 05/09/2026'

  return (
    <div className="pw" ref={wrap}>
      <div className="paper" style={{ ...brandVars(brand), transform: `scale(${scale})` }}>
        <div className="ph">
          <div className={'logo' + (brand?.logo ? ' has-img' : '')}>{brand?.logo ? <img src={brand.logo} alt="" /> : 'LOGO'}</div>
          <div className="tt">
            <b>{s.title || (q ? 'Quote' : 'Invoice')}</b>
            <span>No. 12345</span>
            <br />
            <span>{sub}</span>
          </div>
        </div>
        <div className="adr">
          <div>
            <small>From</small>
            <b>Shine SAS</b>
            <br />
            {contactName || 'David Muehlfeld'}
            <br />
            {s.presets.contact.email && (
              <>
                {s.presets.contact.email}
                <br />
              </>
            )}
            {s.presets.contact.phone && (
              <>
                {s.presets.contact.phone}
                <br />
              </>
            )}
            12 Rue de Rivoli
            <br />
            75001 Paris, France
          </div>
          <div>
            <small>Bill to</small>
            <b>Test Invoice Receiver</b>
            <br />
            John Doe Street 12
            <br />
            11-111 City
          </div>
        </div>
        {refs.length > 0 && (
          <div className="ref">
            {refs.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        )}
        {s.message && <div className="msg">{s.message}</div>}
        <table>
          <thead>
            <tr>
              {heads.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((x, j) => (
                  <td key={j}>{x}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tot">
          {L.map((l) => (
            <div key={l[0]} className={l[2] ? 'g' : undefined}>
              <span>{l[0]}</span>
              <span>{l[1]}</span>
            </div>
          ))}
        </div>
        {s.tcOn && s.tc.trim() && (
          <div className="tc">
            <b>Terms and conditions</b>
            {s.tc}
          </div>
        )}
        <div className="fo">
          {s.footer && <p className="u">{s.footer}</p>}
          <p>
            Payment terms: {s.presets.terms}. No early-payment discount. In case of late payment, a fixed recovery indemnity of €40 applies, plus penalties at 3× the legal
            interest rate.
          </p>
        </div>
      </div>
    </div>
  )
}

export function Thumb() {
  return (
    <div className="thumb">
      <i className="b" />
      <i className="s" />
      <i />
      <i />
      <i className="b" style={{ height: 4, marginTop: 4 }} />
      <i />
      <i />
      <i className="s" style={{ marginTop: 'auto' }} />
    </div>
  )
}
