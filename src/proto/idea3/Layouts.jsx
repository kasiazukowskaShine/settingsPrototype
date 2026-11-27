import { useLayoutEffect, useRef, useState } from 'react'
import Paper from '../../Paper.jsx'
import { eff, newTpl } from '../../data.js'
import './layouts.css'

/**
 * Document layouts for the V3 Branding page, rebuilt from the design references (01 Classic, 02 Swiss Mono,
 * 04 Grotesk Boxed, 05 Condensed). Each is a 794×1123 A4 page coloured by three brand colours and set in a font
 * pair (a display face and a second face for body or labels), then scaled to fit its wrapper.
 * "Standard" comes first: the paper the Templates page already shows (Paper.jsx), tinted with the same brand settings.
 */
export const LAYOUTS = [
  { id: 'standard', name: 'Standard', fonts: ['Inter', 'Inter'] },
  { id: 'classic', name: 'Classic', fonts: ['Playfair Display', 'Inter'] },
  { id: 'swiss', name: 'Swiss Mono', fonts: ['Archivo', 'IBM Plex Mono'] },
  { id: 'boxed', name: 'Grotesk Boxed', fonts: ['Space Grotesk', 'Space Mono'] },
  { id: 'condensed', name: 'Condensed', fonts: ['Oswald', 'Source Sans 3'] },
]
export const PAIRS = [
  ['Playfair Display', 'Inter'],
  ['Archivo', 'IBM Plex Mono'],
  ['DM Serif Display', 'DM Sans'],
  ['Space Grotesk', 'Space Mono'],
  ['Oswald', 'Source Sans 3'],
  ['Cormorant Garamond', 'Montserrat'],
]
const SERIF = ['Playfair Display', 'DM Serif Display', 'Cormorant Garamond']
const MONO = ['IBM Plex Mono', 'Space Mono']
export const stack = (f) => `"${f}", ${SERIF.includes(f) ? 'serif' : MONO.includes(f) ? 'monospace' : 'sans-serif'}`
export const BW = { main: '#000000', text: '#000000', bg: '#FFFFFF' }

const ITEMS = [
  ['Brand identity design', '1', '4,800.00', '4,800.00'],
  ['Website design (per page)', '4', '600.00', '2,400.00'],
  ['Consulting (hours)', '8', '150.00', '1,200.00'],
]
const usd = (n) => '$' + n

function Classic({ logo }) {
  return (
    <>
      <div className="c-head">
        {logo}
        <div className="c-title">Invoice</div>
        <div className="c-no">No. 0001</div>
      </div>
      <div className="c-parties">
        <div><div className="c-h">From</div><div>Your Company Name</div><div className="mu">12 Street Address<br />City, Postcode<br />hello@yourcompany.com</div></div>
        <div><div className="c-h">Billed to</div><div>Client Name</div><div className="mu">45 Client Road<br />City, Postcode<br />client@email.com</div></div>
        <div className="r"><div className="c-h">Details</div><div className="mu">Issued: 02 Nov 2026<br />Due: 16 Nov 2026<br />Terms: Net 14</div></div>
      </div>
      <div className="c-row c-th"><div>Description</div><div>Qty</div><div>Rate</div><div>Amount</div></div>
      {ITEMS.map((r) => (
        <div className="c-row" key={r[0]}><div>{r[0]}</div><div>{r[1]}</div><div>{usd(r[2])}</div><div>{usd(r[3])}</div></div>
      ))}
      <div className="c-sum">
        <div><span className="mu">Subtotal</span><span>$8,400.00</span></div>
        <div><span className="mu">Tax (20%)</span><span>$1,680.00</span></div>
        <div className="c-total"><span>Total due</span><b>$10,080.00</b></div>
      </div>
      <div className="c-foot">
        <div><b>Payment details</b><div className="mu">Bank Name<br />IBAN 00 0000 0000 0000<br />BIC XXXXXXXX</div></div>
        <div className="r"><b>Notes</b><div className="mu">Thank you for your business.<br />Late payments incur a 2% monthly fee.</div></div>
      </div>
    </>
  )
}

function Swiss({ logo }) {
  return (
    <>
      <div className="s-head">
        <div className="s-title">{logo}Invoice</div>
        <div className="s-meta">#0001<br />02.11.2026</div>
      </div>
      <div className="s-grid">
        <div><div className="s-l">From</div><b>Your Company Name</b><div>12 Street Address<br />City, Postcode</div></div>
        <div><div className="s-l">To</div><b>Client Name</b><div>45 Client Road<br />City, Postcode</div></div>
        <div><div className="s-l">Due</div><b>16.11.2026</b><div>Net 14 days</div></div>
        <div><div className="s-l">Amount</div><div className="s-amt">$10,080.00</div></div>
      </div>
      <div>
        <div className="s-row s-th"><div>No.</div><div>Item</div><div>Qty</div><div>Rate</div><div>Total</div></div>
        {ITEMS.map((r, i) => (
          <div className="s-row" key={r[0]}><div>0{i + 1}</div><div className="s-it">{r[0]}</div><div>{r[1]}</div><div>{r[2]}</div><div>{r[3]}</div></div>
        ))}
      </div>
      <div className="s-sum">
        <div><span>Subtotal</span><span>8,400.00</span></div>
        <div><span>VAT 20%</span><span>1,680.00</span></div>
        <div className="s-total"><span>Total USD</span><span>10,080.00</span></div>
      </div>
      <div className="s-foot">
        <div><div className="s-l">Bank</div>Bank Name<br />IBAN 00 0000 0000</div>
        <div><div className="s-l">Contact</div>hello@yourcompany.com<br />+00 000 000 000</div>
        <div className="s-notes"><div className="s-l">Notes</div>Payment due within 14 days. Thank you.</div>
      </div>
    </>
  )
}

function Boxed({ logo }) {
  return (
    <div className="b-box">
      <div className="b-head">
        <div className="b-co">{logo || 'Your Company'}</div>
        <div className="b-mono r">INVOICE<br />No. 0001</div>
      </div>
      <div className="b-three">
        <div><div className="b-l">BILLED TO</div><b>Client Name</b><div>45 Client Road<br />City, Postcode</div></div>
        <div><div className="b-l">DATES</div><div>Issued 02/11/2026<br />Due 16/11/2026</div></div>
        <div><div className="b-l">AMOUNT DUE</div><div className="b-amt">$10,080.00</div></div>
      </div>
      <div className="b-row b-th"><div>ITEM</div><div>QTY</div><div>RATE</div><div>TOTAL</div></div>
      {ITEMS.map((r) => (
        <div className="b-row" key={r[0]}><div className="b-it">{r[0]}</div><div>{r[1]}</div><div>{r[2]}</div><div>{r[3]}</div></div>
      ))}
      <div className="b-fill" />
      <div className="b-bottom">
        <div className="b-pay"><div className="b-l">PAYMENT</div><div>Bank Name<br />IBAN 00 0000 0000 0000<br />BIC XXXXXXXX</div></div>
        <div className="b-sum">
          <div><span>SUBTOTAL</span><span>8,400.00</span></div>
          <div><span>TAX 20%</span><span>1,680.00</span></div>
          <div className="b-total"><span>Total</span><span>$10,080.00</span></div>
        </div>
      </div>
      <div className="b-foot"><span>hello@yourcompany.com</span><span>Thank you.</span></div>
    </div>
  )
}

function Condensed({ logo }) {
  return (
    <>
      {logo && <div className="k-logo">{logo}</div>}
      <div className="k-head">
        <div className="k-title">Invoice</div>
        <div className="k-no">№ 0001</div>
      </div>
      <div className="k-parties">
        <div><div className="k-h">From</div><b>Your Company Name</b><div className="mu">12 Street Address<br />City, Postcode<br />hello@yourcompany.com</div></div>
        <div><div className="k-h">Bill to</div><b>Client Name</b><div className="mu">45 Client Road<br />City, Postcode<br />client@email.com</div></div>
      </div>
      <div className="k-dates">
        <div><span>Issued</span><b>02 NOV 2026</b></div>
        <div><span>Due</span><b>16 NOV 2026</b></div>
        <div><span>Terms</span><b>NET 14</b></div>
      </div>
      <div className="k-table">
        <div className="k-row k-th"><div>Description</div><div>Qty</div><div>Rate</div><div>Amount</div></div>
        {ITEMS.map((r) => (
          <div className="k-row" key={r[0]}><div className="k-it">{r[0]}</div><div>{r[1]}</div><div>{usd(r[2])}</div><div>{usd(r[3])}</div></div>
        ))}
      </div>
      <div className="k-sum">
        <div><span>Subtotal</span><span>$8,400.00</span></div>
        <div><span>Tax (20%)</span><span>$1,680.00</span></div>
      </div>
      <div className="k-foot">
        <div className="mu"><div className="k-h0">Payment</div>Bank Name<br />IBAN 00 0000 0000 0000<br />BIC XXXXXXXX</div>
        <div className="k-total"><span>Total due</span><b>$10,080.00</b></div>
      </div>
    </>
  )
}

const BODY = { classic: Classic, swiss: Swiss, boxed: Boxed, condensed: Condensed }

/** The full A4 page at 794×1123, before scaling. */
export function Doc({ layout = 'classic', colors = BW, fonts, logo }) {
  const L = LAYOUTS.find((x) => x.id === layout) || LAYOUTS[0]
  const [h, b] = fonts || L.fonts
  const Body = BODY[L.id]
  const style = { '--m': colors.main, '--t': colors.text, '--b': colors.bg, '--fh': stack(h), '--fb': stack(b) }
  return (
    <div className={'dl dl-' + L.id} style={style}>
      <Body logo={logo ? <img className="dl-logo" src={logo} alt="" /> : null} />
    </div>
  )
}

const STANDARD = eff(newTpl('Default template', true), 'inv')
const ALL = { header: true, columnHeaders: true, lines: true, total: true }

/** The Templates page paper, recoloured and re-fonted from the brand (title in the display face, the rest in the second). */
function StandardSheet({ className, colors = BW, fonts = LAYOUTS[0].fonts, logo, s = STANDARD }) {
  const style = { '--t': colors.text, '--b': colors.bg, '--fh': stack(fonts[0]) }
  return (
    <div className={'dl-paper ' + className} style={style}>
      <Paper s={s} brand={{ font: fonts[1], color: colors.main, apply: ALL, logo }} />
    </div>
  )
}

/** A Doc scaled to the width of its wrapper (keeps A4 proportions). */
export function Sheet({ className = '', ...props }) {
  if (props.layout === 'standard') return <StandardSheet className={className} {...props} />
  return <ScaledDoc className={className} {...props} />
}

function ScaledDoc({ className, ...props }) {
  const wrap = useRef(null)
  const [scale, setScale] = useState(0)
  useLayoutEffect(() => {
    const el = wrap.current
    const update = () => el.clientWidth && setScale(el.clientWidth / 794)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className={'dl-wrap ' + className} ref={wrap}>
      <div className="dl-scale" style={{ transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}>
        <Doc {...props} />
      </div>
    </div>
  )
}

/**
 * A template's preview in a brand: Standard shows the template itself (its columns, references, messages) on the
 * branded paper; the other layouts show the layout in the brand's colours, fonts and logo.
 */
export function TemplatePreview({ t, kind = 'inv', brand }) {
  const colors = { main: brand.main, text: brand.text, bg: brand.bg }
  return (
    <div className="pw">
      {brand.layout === 'standard' ? (
        <StandardSheet s={eff(t, kind)} colors={colors} fonts={brand.fonts} logo={brand.logo} />
      ) : (
        <Sheet layout={brand.layout} colors={colors} fonts={brand.fonts} logo={brand.logo} />
      )}
    </div>
  )
}
