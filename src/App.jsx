import { useCallback, useEffect, useRef, useState } from 'react'
import InvoicesApp from './InvoicesApp.jsx'
import SettingsModal from './SettingsModal.jsx'
import { newTpl } from './data.js'
// PROTO:idea start
import IdeaOne from './proto/idea1/IdeaOne.jsx'
import ProtoPicker from './proto/SearchPicker.jsx'
import { PROTO, useVariant } from './proto/store.js'
// PROTO:idea end
export default function App() {
  const idea = useVariant('i') // PROTO:idea
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState(() => [newTpl('Default template', true)])
  const [toastMsg, setToastMsg] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const timer = useRef()

  // PROTO:idea start
  // Switching ideas swaps the whole window. `switching` is set in the same render as the swap, so the new
  // window mounts with its entrance animations at zero duration instead of replaying them (flicker).
  const prevIdea = useRef(idea)
  const [switching, setSwitching] = useState(false)
  if (prevIdea.current !== idea) {
    prevIdea.current = idea
    setSwitching(true)
  }
  useEffect(() => {
    if (!switching) return
    const t = setTimeout(() => setSwitching(false), 150)
    return () => clearTimeout(t)
  }, [switching])
  // PROTO:idea end

  const toast = useCallback((m) => {
    setToastMsg(m)
    setToastOn(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToastOn(false), 2600)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      <InvoicesApp onSettings={() => setOpen(true)} onNA={() => toast('Not part of this prototype')} />
      <div className="modal-root" data-switch={switching ? '' : undefined}>
        {/* PROTO:idea start */}
        {open && PROTO && idea === 1 && <IdeaOne toast={toast} onClose={() => setOpen(false)} />}
        {open && !(PROTO && idea === 1) && <SettingsModal templates={templates} setTemplates={setTemplates} toast={toast} onClose={() => setOpen(false)} />}
        {/* PROTO:idea end */}
      </div>
      {/* PROTO:idea start */}
      {open && PROTO && <ProtoPicker kind="i" />}
      {/* PROTO:idea end */}
      <div className={'toast' + (toastOn ? ' on' : '')} role="status" aria-live="polite">
        {toastMsg}
      </div>
    </>
  )
}
