import { ICONS } from './Icon.jsx'

/**
 * Settings page layout: the live preview has its own column next to the sidebar, the content sits on the right
 * with the title, actions and close button in one header row, and a Discard / Save bar at the bottom.
 * Lists, forms and editors all use it, so the preview is always on the left.
 *
 * - `onBack` adds a back arrow before the title (editors).
 * - `onCreate` adds the "Create a template" button (template lists).
 * - `footer` replaces the default bar. On a list there is nothing to save, so the default buttons are disabled.
 */
export default function ListLayout({ title, onBack, backLabel = 'Back', preview, onCreate, onClose, footer, children }) {
  return (
    <div className="lview">
      <aside className="lv-pv">
        <div className="lv-pv-in">{preview}</div>
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
            <button className="lv-x" onClick={onClose} aria-label="Close settings">
              {ICONS.close()}
            </button>
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
