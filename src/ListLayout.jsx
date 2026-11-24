import { createContext, useContext } from 'react'
import { ICONS } from './Icon.jsx'

/**
 * Which frame the page renders into. 'lview' (default) is the settings modal page; 'i3' and 'lumen' render the same
 * page as the idea 3 / Lumen header + split body, so V1's settings can be shown in those layouts without new pages.
 * Both keep the page's buttons in a footer bar under the page, with the close button alone in the top-right corner.
 */
export const ShellContext = createContext('lview')

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
  const shell = useContext(ShellContext)
  const close = onClose && (
    <button className="lv-x" onClick={onClose} aria-label="Close settings">
      {ICONS.close()}
    </button>
  )
  if (shell === 'i3' || shell === 'lumen') {
    // idea 3 / Lumen frame: actions (and the page's own buttons) in the header, form card left, preview right
    return (
      <>
        <header className={'i3-head' + (onBack ? ' ed' : '')}>
          <h2>
            {onBack && (
              <button className="back" onClick={onBack} aria-label={backLabel}>
                {ICONS.back()}
              </button>
            )}
            <span className="i3-title">{title}</span>
          </h2>
          <div className="i3-acts">
            {onCreate && (
              <button className="btn dark" onClick={onCreate}>
                Create a template
              </button>
            )}
            {close}
          </div>
        </header>
        <div className="i3-body">
          <div className="i3-left">
            <div className="i3-card">
              <div className="i3-form">{children}</div>
            </div>
          </div>
          <aside className="i3-pv" aria-label="Preview">
            {preview}
          </aside>
        </div>
        {footer && <div className="i3-foot">{footer}</div>}
      </>
    )
  }
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
