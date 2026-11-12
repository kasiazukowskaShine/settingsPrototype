import Paper from '../../Paper.jsx'
import ListLayout from '../../ListLayout.jsx'
import GeneralPresets from '../../GeneralPresets.jsx'
import { Fld } from '../../TemplateEditor.jsx'
import { clone, eff, newTpl, setP } from '../../data.js'

const sample = newTpl('', false)

/** Document presets: language, currency, payment terms and contact person that every template starts from. */
export default function PresetsPage({ draft, setDraft, dirty, onSave, onDiscard, onClose, brand }) {
  const set = (path, val) =>
    setDraft((d) => {
      const c = clone(d)
      setP(c, path.replace(/^presets\./, ''), val)
      return c
    })
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
    <ListLayout title="Document presets" preview={<Paper s={eff({ ...sample, presets: draft }, 'inv')} brand={brand} />} onClose={onClose} footer={footer}>
      <div className="lv-form">
        <GeneralPresets t={{ presets: draft }} set={set} hl={null} Fld={Fld} />
      </div>
    </ListLayout>
  )
}
