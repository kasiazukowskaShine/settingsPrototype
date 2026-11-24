import { ICONS } from '../Icon.jsx'
import ListLayout from '../ListLayout.jsx'
import '../proto/idea3/idea3.css'
import './invoice.css'

/**
 * Shared shell for create flows. 'i3': full-screen split editor (header actions, 50/50 form and preview).
 * 'modal': the focused list layout (back arrow, form left, preview right, actions in the bottom bar).
 */
export default function FlowLayout({ L, title, onBack, backLabel, actions, form, preview }) {
  if (L.flow === 'i3') {
    const lumen = L.lumen
    return (
      <div className={'i3 full' + (lumen ? ' lm' : '') + (L.keepNav ? ' kn' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <aside className="i3-nav" aria-hidden="true" />
        <div className="i3-main">
          <header className="i3-head ed">
            <h2>
              <button className="back" onClick={onBack} aria-label={backLabel}>
                {ICONS.back()}
              </button>
              <span className="i3-title">{title}</span>
            </h2>
            <div className="i3-acts">{actions}</div>
          </header>
          <div className="i3-body">
            <div className="i3-left">{form}</div>
            <aside className="i3-pv" aria-label="Preview">
              {preview}
            </aside>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={'modal focus' + (L.keepNav ? ' kn' : '')} role="dialog" aria-modal="true" aria-label={title}>
      <aside className="snav" aria-hidden="true" />
      <section className="mcol">
        <ListLayout title={title} onBack={onBack} backLabel={backLabel} preview={preview} footer={actions}>
          {form}
        </ListLayout>
      </section>
    </div>
  )
}
