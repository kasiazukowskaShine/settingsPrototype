import { useEffect, useRef } from 'react'
import Paper from '../Paper.jsx'
import GeneralPresets from '../GeneralPresets.jsx'
import { ICONS } from '../Icon.jsx'
import { Form, Sw, Fld } from '../TemplateEditor.jsx'
import { TYL, eff } from '../data.js'
import './steps.css'

const STEPS = ['general', 'inv', 'quo']

/** Variant 1 (creation): the steps live in the left sidebar instead of tabs above the form. */
export function StepsNav({ E, setTab }) {
  return (
    <aside className="snav steps-nav">
      {STEPS.map((k) => (
        <button key={k} className={'sit steps-item' + (E.tab === k ? ' on' : '')} aria-current={E.tab === k ? 'step' : undefined} onClick={() => setTab(k)}>
          {TYL[k]}
        </button>
      ))}
    </aside>
  )
}

export function StepsEditor({ E, set, setTab, onPaste, onBack, onSave, onNameError }) {
  const nameRef = useRef(null)
  const idx = STEPS.indexOf(E.tab)
  const last = idx === STEPS.length - 1

  useEffect(() => {
    if (E.err && nameRef.current) nameRef.current.focus()
  }, [E.err])

  const next = () => {
    if (last) return onSave()
    if (E.tab === 'general' && !E.draft.name.trim()) return onNameError()
    setTab(STEPS[idx + 1])
  }

  const t = E.draft
  return (
    <>
      <div className="ehead">
        <h2>
          <button className="back" onClick={onBack} aria-label="Back to templates">
            {ICONS.back()}
          </button>
          <span>Create a template</span>
        </h2>
      </div>
      <div className="egrid steps-grid">
        <div key={E.tab}>
          {E.tab === 'general' ? (
            <>
              <Fld id="default">
                <div className="trow" style={{ padding: 0 }}>
                  <span style={{ fontWeight: 500 }}>Default</span>
                  <Sw checked={t.isDef} onChange={(v) => set('isDef', v)} />
                </div>
              </Fld>
              <Fld id="name">
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
                  autoFocus
                  onChange={(e) => set('name', e.target.value)}
                />
                {E.err && <div className="errt">Enter a template name</div>}
              </Fld>
              <GeneralPresets t={t} set={set} hl={null} Fld={Fld} />
            </>
          ) : (
            <Form E={E} set={set} hl={null} onPaste={onPaste} nameRef={nameRef} />
          )}
        </div>
        <aside className="pvp ed">
          <div className="pvh">
            <span>Live preview</span>
          </div>
          <Paper s={eff(t, E.tab === 'quo' ? 'quo' : 'inv')} />
        </aside>
      </div>
      <div className="efoot steps-foot">
        <button className="btn dark" onClick={next}>
          {last ? 'Save template' : 'Next'}
        </button>
      </div>
    </>
  )
}
