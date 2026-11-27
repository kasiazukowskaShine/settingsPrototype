import { useCallback, useEffect, useRef, useState } from 'react'
import InvoicesApp from './InvoicesApp.jsx'
import SettingsModal from './SettingsModal.jsx'
import { newTpl } from './data.js'
import InvoiceCreate from './invoice/InvoiceCreate.jsx'
import InvoiceView from './invoice/InvoiceView.jsx'
import PurchaseCreate from './purchase/PurchaseCreate.jsx'
// PROTO:idea start
import IdeaOne from './proto/idea1/IdeaOne.jsx'
import IdeaThree from './proto/idea3/IdeaThree.jsx'
import ProtoMenu from './proto/ProtoMenu.jsx'
import { PROTO, useLayout, useVariant } from './proto/store.js'
// PROTO:idea end
export default function App() {
  const L = useLayout() // PROTO:idea
  const pvSide = useVariant('p') // PROTO:idea
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [view, setView] = useState(null)
  const [buying, setBuying] = useState(false)
  const [purchases, setPurchases] = useState([])
  const [templates, setTemplates] = useState(() => [newTpl('Default template', true)])
  const [toastMsg, setToastMsg] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const timer = useRef()

  // PROTO:idea start
  // Switching ideas swaps the whole window. `switching` is set in the same render as the swap, so the new
  // window mounts with its entrance animations at zero duration instead of replaying them (flicker).
  const prevIdea = useRef(L.id)
  const [switching, setSwitching] = useState(false)
  if (prevIdea.current !== L.id) {
    prevIdea.current = L.id
    setSwitching(true)
  }
  useEffect(() => {
    if (!switching) return
    const t = setTimeout(() => setSwitching(false), 150)
    return () => clearTimeout(t)
  }, [switching])
  // PROTO:idea end

  // PROTO:idea start
  // The preview side is a prototype setting, so the layouts read it off the root instead of threading a prop.
  useEffect(() => {
    document.documentElement.dataset.pv = pvSide === 2 ? 'left' : 'right'
  }, [pvSide])
  // PROTO:idea end

  const toast = useCallback((m) => {
    setToastMsg(m)
    setToastOn(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToastOn(false), 2600)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open || creating || view || buying ? 'hidden' : ''
  }, [open, creating, view, buying])

  return (
    <>
      <InvoicesApp locked={(L.keepNav && (creating || buying)) || (L.viewNav && !!view)} onSettings={() => setOpen(true)} onCreate={() => setCreating(true)} onOpen={setView} purchases={purchases} onCreatePurchase={() => setBuying(true)} onNA={() => toast('Not part of this prototype')} />
      {creating && <InvoiceCreate L={L} toast={toast} onSettings={() => setOpen(true)} paused={open} onClose={() => setCreating(false)} onFinalise={(i) => { setCreating(false); setView({ ...i, enter: true }) }} />}
      {view && <InvoiceView L={L} inv={view} enter={view.enter} toast={toast} onClose={() => setView(null)} />}
      {buying && <PurchaseCreate L={L} toast={toast} onClose={() => setBuying(false)} onAdd={(p) => { setPurchases((x) => [...x, p]); setBuying(false) }} />}
      <div className="modal-root" data-switch={switching ? '' : undefined}>
        {/* PROTO:idea start */}
        {open && PROTO && L.settings === 'one' && <IdeaOne L={L} toast={toast} onClose={() => setOpen(false)} />}
        {open && PROTO && L.settings === 'three' && <IdeaThree lumen={L.lumen} sheet={L.sheet} fit={L.fit} templates={templates} setTemplates={setTemplates} toast={toast} onClose={() => setOpen(false)} />}
        {open && (!PROTO || L.settings === 'modal') && <SettingsModal sheet={PROTO && L.sheet} templates={templates} setTemplates={setTemplates} toast={toast} onClose={() => setOpen(false)} />}
        {/* PROTO:idea end */}
      </div>
      {/* PROTO:idea start */}
      {PROTO && <ProtoMenu />}
      {/* PROTO:idea end */}
      <div className={'toast' + (toastOn ? ' on' : '')} role="status" aria-live="polite">
        {toastMsg}
      </div>
    </>
  )
}
