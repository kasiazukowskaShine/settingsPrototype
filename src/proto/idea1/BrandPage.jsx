import { useRef, useState } from 'react'
import Paper from '../../Paper.jsx'
import ListLayout from '../../ListLayout.jsx'
import { Sw } from '../../TemplateEditor.jsx'
import Icon from '../../Icon.jsx'
import { eff, newTpl } from '../../data.js'

const FONTS = ['Open Sans', 'Inter', 'Roboto', 'Lora', 'Montserrat']
const APPLY = [
  ['header', 'Document header'],
  ['columnHeaders', 'Column headers'],
  ['lines', 'Table lines'],
  ['total', 'Total amount'],
]
const HEX = /^#[0-9a-f]{6}$/i
const sample = newTpl('', false)

/** Logo & branding: logo upload, font and brand color, with a live paper preview. */
export default function BrandPage({ draft, setDraft, dirty, onSave, onDiscard, onClose, presets }) {
  const file = useRef(null)
  const [err, setErr] = useState('')
  const [hex, setHex] = useState(draft.color)
  const [drag, setDrag] = useState(false)

  const upd = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const onFile = (f) => {
    if (!f) return
    if (!/^(image\/(png|jpeg)|application\/pdf)$/.test(f.type)) return setErr('Use a PDF, JPG or PNG file.')
    if (f.size > 5 * 1024 * 1024) return setErr('This file is larger than 5 MB.')
    setErr('')
    const r = new FileReader()
    r.onload = () => upd({ logo: f.type === 'application/pdf' ? null : r.result, logoName: f.name })
    r.readAsDataURL(f)
  }

  const setColor = (v) => {
    setHex(v)
    if (HEX.test(v)) upd({ color: v.toUpperCase() })
  }

  const footer = (
    <>
      <button className="btn wh outline" onClick={onDiscard} disabled={!dirty}>
        Discard
      </button>
      <button className="btn dark" onClick={onSave} disabled={!dirty}>
        Save changes
      </button>
    </>
  )

  return (
    <ListLayout title="Logo & branding" preview={<Paper s={eff({ ...sample, presets }, 'inv')} brand={draft} />} onClose={onClose} footer={footer}>
      <div className="lv-form">
        <span className="fl" style={{ marginBottom: 2 }}>
          Company logo
        </span>
        <div className="help" style={{ marginTop: 0 }}>
          Add your company logo to your invoices.
        </div>
        {draft.logoName ? (
          <div className="upl done">
            {draft.logo ? <img src={draft.logo} alt="" /> : <Icon d="M6 3h8l4 4v14H6zM14 3v4h4" />}
            <span className="upl-name">{draft.logoName}</span>
            <button className="btn sm wh" onClick={() => upd({ logo: null, logoName: '' })}>
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={'upl' + (drag ? ' drag' : '')}
            onClick={() => file.current.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDrag(false)
              onFile(e.dataTransfer.files[0])
            }}
          >
            <Icon>
              <path d="M7 18a4 4 0 01-.5-7.97A5.5 5.5 0 0117 8.5a4.75 4.75 0 01-.5 9.5M12 12v8M9 14.5l3-3 3 3" />
            </Icon>
            Upload image
          </button>
        )}
        <input ref={file} type="file" hidden accept="image/png,image/jpeg,application/pdf" onChange={(e) => { onFile(e.target.files[0]); e.target.value = '' }} />
        {err ? <div className="errt">{err}</div> : <div className="help">Accepted formats: PDF, JPG, PNG (5 MB max)</div>}

        <hr className="bhr" />

        <label className="fl" htmlFor="bfont">
          Font
        </label>
        <select id="bfont" className="sel" value={draft.font} onChange={(e) => upd({ font: e.target.value })}>
          {FONTS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>

        <hr className="bhr" />

        <span className="fl" style={{ marginBottom: 2 }}>
          Color
        </span>
        <div className="help" style={{ marginTop: 0 }}>
          Select or customize your brand color.
        </div>
        <div className="colrow">
          <label className="swatch" style={{ background: draft.color }} aria-label="Pick a brand color">
            <input type="color" value={draft.color.toLowerCase()} onChange={(e) => setColor(e.target.value)} />
          </label>
          <input
            className={'inp hex' + (HEX.test(hex) ? '' : ' err')}
            value={hex}
            maxLength={7}
            spellCheck={false}
            aria-label="Brand color hex value"
            onChange={(e) => setColor(e.target.value)}
            onBlur={() => setHex(draft.color)}
          />
        </div>

        <span className="fl" style={{ marginTop: 22 }}>
          Apply to:
        </span>
        {APPLY.map(([k, label]) => (
          <div className="trow" key={k}>
            <span>{label}</span>
            <Sw checked={draft.apply[k]} onChange={(v) => upd({ apply: { ...draft.apply, [k]: v } })} />
          </div>
        ))}
      </div>
    </ListLayout>
  )
}
