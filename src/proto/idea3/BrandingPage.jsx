import { useEffect, useId, useRef, useState } from 'react'
import { BW, LAYOUTS, PAIRS, Sheet, stack } from './Layouts.jsx'
import './branding.css'

/**
 * V3 Branding page (settings › Branding): two tabs, "Color and layout" (brand colours + document layout) and
 * "Logo and fonts" (company logo + font pair), with the chosen layout previewed on the right in the brand's
 * colours and fonts. Layout thumbnails stay black and white so they compare structure, not colour.
 */
// starts on Standard, the layout the Templates page shows
const DEFAULT = { main: '#273DCE', text: '#000000', bg: '#FFFFFF', layout: 'standard', fonts: LAYOUTS[0].fonts, logo: null, logoName: '' }
const HEX = /^#[0-9a-f]{6}$/i
const ACCEPT = ['image/png', 'image/jpeg', 'application/pdf']
const MAX = 5 * 1024 * 1024

// Kept outside React so saved branding survives closing and reopening settings.
let saved = DEFAULT

const UPLOAD = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 18a4.5 4.5 0 01-.6-8.96A6 6 0 0118 8.5h.5a4 4 0 01.5 7.97" />
    <path d="M12 12v9M8.5 15.5L12 12l3.5 3.5" />
  </svg>
)

function ColorRow({ id, label, value, onChange }) {
  const [txt, setTxt] = useState(value)
  useEffect(() => setTxt(value), [value])
  return (
    <div className="bp-crow">
      <label htmlFor={id}>{label}</label>
      <label className="bp-sw" style={{ '--c': value }} aria-label={label + ' colour picker'}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />
      </label>
      <input
        id={id}
        className={'inp' + (HEX.test(txt) ? '' : ' err')}
        value={txt}
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => {
          let v = e.target.value.trim()
          if (v && v[0] !== '#') v = '#' + v
          setTxt(v.toUpperCase())
          if (HEX.test(v)) onChange(v.toUpperCase())
        }}
        onBlur={() => setTxt(value)}
      />
    </div>
  )
}

/** The branding controls (tabs, colours, layouts, logo, font pairs). Shared by the Branding page and the wizard's Branding step. */
export function BrandingForm({ b, setB }) {
  const [tab, setTab] = useState('color')
  const [drag, setDrag] = useState(false)
  const [fileErr, setFileErr] = useState('')
  const fileRef = useRef(null)
  const id = useId()
  const set = (k, v) => setB((x) => ({ ...x, [k]: v }))
  const pickFile = (f) => {
    if (!f) return
    if (!ACCEPT.includes(f.type)) return setFileErr('Use a PDF, JPG or PNG file.')
    if (f.size > MAX) return setFileErr('This file is over 5 MB.')
    setFileErr('')
    if (f.type === 'application/pdf') return setB((x) => ({ ...x, logo: null, logoName: f.name }))
    const r = new FileReader()
    r.onload = () => setB((x) => ({ ...x, logo: r.result, logoName: f.name }))
    r.readAsDataURL(f)
  }
  const tabs = [
    ['color', 'Color and layout'],
    ['logo', 'Logo and fonts'],
  ]
  return (
    <>
    <div className="bp-tabs" role="tablist" aria-label="Branding sections">
      {tabs.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
          {l}
        </button>
      ))}
    </div>

    <div className="bp-panel" key={tab} role="tabpanel">
      {tab === 'color' ? (
        <>
          <section className="bp-sec">
            <h3>Colors</h3>
            <p>Select or customise your brand colours.</p>
            <ColorRow id={id + 'm'} label="Main" value={b.main} onChange={(v) => set('main', v)} />
            <ColorRow id={id + 't'} label="Text" value={b.text} onChange={(v) => set('text', v)} />
            <ColorRow id={id + 'b'} label="Background" value={b.bg} onChange={(v) => set('bg', v)} />
          </section>
          <section className="bp-sec">
            <h3>Layout</h3>
            <p>Choose your default document layout.</p>
            <div className="bp-layouts" role="radiogroup" aria-label="Document layout">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  role="radio"
                  aria-checked={b.layout === l.id}
                  aria-label={l.name}
                  title={l.name}
                  className={'bp-lay' + (b.layout === l.id ? ' on' : '')}
                  onClick={() => setB((x) => ({ ...x, layout: l.id, fonts: l.fonts }))}
                >
                  <Sheet layout={l.id} colors={BW} />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="bp-sec">
            <h3>Company logo</h3>
            <p>Add your company logo to your invoices.</p>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => pickFile(e.target.files[0])} />
            {b.logoName ? (
              <div className="bp-file">
                <div className="bp-thumb">{b.logo ? <img src={b.logo} alt="" /> : <span>PDF</span>}</div>
                <span className="bp-fname">{b.logoName}</span>
                <button className="btn wh ic-out sm" onClick={() => fileRef.current.click()}>Replace</button>
                <button className="btn wh ic-out sm" onClick={() => setB((x) => ({ ...x, logo: null, logoName: '' }))}>Remove</button>
              </div>
            ) : (
              <button
                className={'bp-drop' + (drag ? ' over' : '')}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDrag(true)
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDrag(false)
                  pickFile(e.dataTransfer.files[0])
                }}
              >
                {UPLOAD}Upload image
              </button>
            )}
            <div className={fileErr ? 'errt' : 'help'}>{fileErr || 'Accepted formats: PDF, JPG, PNG (5 MB max)'}</div>
          </section>
          <section className="bp-sec">
            <h3>Recommended font pairs</h3>
            <div className="bp-pairs" role="radiogroup" aria-label="Font pair">
              {PAIRS.map((p) => {
                const on = b.fonts[0] === p[0] && b.fonts[1] === p[1]
                return (
                  <button key={p[0]} role="radio" aria-checked={on} className={'bp-pair' + (on ? ' on' : '')} onClick={() => set('fonts', p)}>
                    <span style={{ fontFamily: stack(p[0]) }}>{p[0]}</span>
                    <small style={{ fontFamily: stack(p[1]) }}>{p[1]}</small>
                  </button>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
    </>
  )
}

/** The chosen layout in the brand's colours, fonts and logo, sized for the preview panel. */
export function BrandPreview({ b }) {
  return (
    <div className="pw">
      <Sheet layout={b.layout} colors={{ main: b.main, text: b.text, bg: b.bg }} fonts={b.fonts} logo={b.logo} />
    </div>
  )
}

/** Company branding as last saved on the Branding page (new templates start from it). */
export const savedBranding = () => saved

/** The branding a template prints with: its own when it customises Branding, otherwise the company's. */
export const brandFor = (t) => (t?.picks?.brand && t.brand?.layout ? t.brand : saved)

export default function BrandingPage({ toast, onDirty }) {
  const [orig, setOrig] = useState(saved)
  const [b, setB] = useState(saved)
  const dirty = JSON.stringify(b) !== JSON.stringify(orig)
  useEffect(() => {
    onDirty(dirty)
  }, [dirty])
  const save = () => {
    saved = b
    setOrig(b)
    toast('Branding saved. It applies to new documents.')
  }

  return (
    <>
      <div className="i3-body bp">
        <div className="i3-left">
          <BrandingForm b={b} setB={setB} />
        </div>
        <aside className="i3-pv" aria-label="Preview">
          <BrandPreview b={b} />
        </aside>
      </div>
      <footer className="wz-foot">
        <button className="btn dark" disabled={!dirty} onClick={save}>
          Save changes
        </button>
      </footer>
    </>
  )
}
