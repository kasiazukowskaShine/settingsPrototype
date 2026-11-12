import Paper from '../../Paper.jsx'
import GeneralPresets from '../../GeneralPresets.jsx'
import { Fld } from '../../TemplateEditor.jsx'
import { clone, eff, newTpl, setP } from '../../data.js'

const sample = newTpl('', false)

/** Document presets: language, currency, payment terms and contact person that every template starts from. */
export default function PresetsPage({ draft, setDraft, dirty, onSave, onDiscard, brand }) {
  const set = (path, val) =>
    setDraft((d) => {
      const c = clone(d)
      setP(c, path.replace(/^presets\./, ''), val)
      return c
    })
  return (
    <>
      <div className="ehead">
        <h2>Document presets</h2>
      </div>
      <div className="egrid idea-grid">
        <div>
          <GeneralPresets t={{ presets: draft }} set={set} hl={null} Fld={Fld} />
        </div>
        <aside className="pvp ed">
          <div className="pvh">
            <span>Live preview</span>
          </div>
          <Paper s={eff({ ...sample, presets: draft }, 'inv')} brand={brand} />
        </aside>
      </div>
      <div className="efoot line">
        <div className="bt">
          <button className="btn wh outline" onClick={onDiscard} disabled={!dirty}>
            Discard
          </button>
          <button className="btn dark" onClick={onSave} disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}
