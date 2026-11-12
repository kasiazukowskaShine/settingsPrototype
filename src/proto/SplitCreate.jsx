import { useEffect, useRef } from 'react'
import Paper from '../Paper.jsx'
import { ICONS } from '../Icon.jsx'
import { Form } from '../TemplateEditor.jsx'
import { TYL, eff } from '../data.js'
import './split.css'

/** Creation variant 3: full-screen split. Title and actions in a top bar, form on the left, preview card on the right. */
export default function SplitCreate({ E, set, setTab, setPv, onPaste, onDiscard, onSave }) {
  const nameRef = useRef(null)

  useEffect(() => {
    if (E.err && nameRef.current) nameRef.current.focus()
  }, [E.err])

  return (
    <div className="split">
      <header className="split-head">
        <h2>
          <button className="back" onClick={onDiscard} aria-label="Back to templates">
            {ICONS.back()}
          </button>
          <span>Create a template</span>
        </h2>
        <div className="bt">
          <button className="btn" onClick={onDiscard}>
            Discard
          </button>
          <button className="btn dark" onClick={onSave}>
            Save
          </button>
        </div>
      </header>
      <div className="split-main">
        <section className="split-form">
          <div className="tabs" role="tablist">
            {['general', 'inv', 'quo'].map((k) => (
              <button key={k} className={'tab' + (E.tab === k ? ' on' : '')} role="tab" aria-selected={E.tab === k} onClick={() => setTab(k)}>
                {TYL[k]}
              </button>
            ))}
          </div>
          <div className="split-fields" key={E.tab}>
            <Form E={E} set={set} hl={null} onPaste={onPaste} nameRef={nameRef} />
          </div>
        </section>
        <aside className="split-pv">
          <div className="seg">
            <button className={E.pv === 'inv' ? 'on' : ''} onClick={() => setPv('inv')}>
              Invoice
            </button>
            <button className={E.pv === 'quo' ? 'on' : ''} onClick={() => setPv('quo')}>
              Quote
            </button>
          </div>
          <div className="split-paper">
            <Paper s={eff(E.draft, E.pv)} />
          </div>
        </aside>
      </div>
    </div>
  )
}
