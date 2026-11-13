import { ICONS } from './Icon.jsx'

/**
 * Settings page layout: the content sits next to the sidebar with the title and actions in one header row and a
 * Discard / Save bar at the bottom; the live preview has its own column on the right with the close button in its corner.
 * Lists, forms and editors all use it, so the preview is always on the right.
 *
 * - `onBack` adds a back arrow before the title (editors).
 * - `onCreate` adds the "Create a template" button (template lists).
 * - `footer` replaces the default bar. On a list there is nothing to save, so the default buttons are disabled.
 */
export default function ListLayout({ title, onBack, backLabel = 'Back', preview, onCreate, onClose, footer, children }) {
  const close = (
    <button className="lv-x" onClick={onClose} aria-label="Close settings">
      {ICONS.close()}
    </button>
  )
  return (
    <div className="lview">
      <aside className="lv-pv">
        <div className="lv-pv-in">{preview}</div>
        <div className="lv-pv-x">{close}</div>
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
