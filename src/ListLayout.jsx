import { ICONS } from './Icon.jsx'

/**
 * Settings page layout: the content sits next to the sidebar with the title and actions in one header row and a
 * Discard / Save bar at the bottom; the live preview has its own column with the close button in its corner.
 * The close button always sits top right: in the preview's corner when the preview is on the right, at the end of the
 * header row when the prototype puts the preview on the left.
 * Lists, forms and editors all use it, so the preview is always on the right.
 *
 * - `onBack` adds a back arrow before the title (editors).
 * - `onCreate` adds the "Create a template" button (template lists).
 * - `footer` replaces the default bar. On a list there is nothing to save, so the default buttons are disabled.
 * - `onClose` adds the close button. Create flows leave it out (the back arrow leaves them), and their preview then
 *   sits centred in the grey panel, since there is no button band above it to line up with.
 */
export default function ListLayout({ title, onBack, backLabel = 'Back', preview, onCreate, onClose, footer, children }) {
  const close = onClose && (
    <button className="lv-x" onClick={onClose} aria-label="Close settings">
      {ICONS.close()}
    </button>
  )
  return (
    <div className={'lview' + (close ? '' : ' nox')}>
      <aside className="lv-pv">
        <div className="lv-pv-in">{preview}</div>
        {close && <div className="lv-pv-x">{close}</div>}
      </aside>
      <section className="lv-main">
        <div className="lv-head">
          <h2>
            {onBack && (
              <button className="back" onClick={onBack} aria-label={backLabel}>
                {ICONS.back()}
              </button>
            )}
            <span className="lv-title">{title}</span>
          </h2>
          <div className="lv-acts">
            {onCreate && (
              <button className="btn" onClick={onCreate}>
                Create a template
              </button>
            )}
            {close && <div className="lv-head-x">{close}</div>}
          </div>
        </div>
        <div className="lv-list">{children}</div>
        <div className="lv-foot">
          {footer || (
            <>
              <button className="btn wh outline" disabled>
                Discard
              </button>
              <button className="btn dark" disabled>
                Save changes
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
