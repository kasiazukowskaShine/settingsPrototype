import { useCallback, useEffect, useRef, useState } from 'react'
import InvoicesApp from './InvoicesApp.jsx'
import SettingsModal from './SettingsModal.jsx'
import { newTpl } from './data.js'
// PROTO:idea start
import IdeaOne from './proto/idea1/IdeaOne.jsx'
import { PROTO, useVariant } from './proto/store.js'
// PROTO:idea end
export default function App() {
  const idea = useVariant('i') // PROTO:idea
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState(() => [newTpl('Default template', true)])
  const [toastMsg, setToastMsg] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const timer = useRef()

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
      {/* PROTO:idea start */}
      {open && PROTO && idea === 1 && <IdeaOne toast={toast} onClose={() => setOpen(false)} />}
      {open && !(PROTO && idea === 1) && <SettingsModal templates={templates} setTemplates={setTemplates} toast={toast} onClose={() => setOpen(false)} />}
      {/* PROTO:idea end */}
      <div className={'toast' + (toastOn ? ' on' : '')} role="status" aria-live="polite">
        {toastMsg}
      </div>
    </>
  )
}
