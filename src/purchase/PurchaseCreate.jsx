import { useEffect, useRef, useState } from 'react'
import FlowLayout from '../invoice/FlowLayout.jsx'
import PurchaseForm, { fmt, newPurchase, totals } from './PurchaseForm.jsx'
import ReceiptPreview from './ReceiptPreview.jsx'
import './purchase.css'

/** Add a purchase, opened from Expenses > Purchases. The layout follows the selected variant. */
export default function PurchaseCreate({ L, toast, onClose, onAdd }) {
  const [d, setD] = useState(newPurchase)
  const [orig] = useState(newPurchase)
  const [err, setErr] = useState(false)
  const [dlg, setDlg] = useState(false)
  const set = (k, v) => {
    setD((x) => ({ ...x, [k]: v }))
    if (k === 'supplier' && v) setErr(false)
  }
  const dirty = JSON.stringify(d) !== JSON.stringify(orig)
  const leave = () => (dirty ? setDlg(true) : onClose())
  const submit = (draft) => {
    if (!d.supplier) {
      setErr(true)
      document.getElementById('pf-sup')?.focus()
      return
    }
    onAdd({ supplier: d.supplier, ref: d.ref, date: d.date, amount: fmt(totals(d).incl) + ' EUR', draft })
    toast(draft ? 'Purchase saved.' : 'Purchase added.')
  }

  const latest = useRef()
  latest.current = { dlg, leave }
  useEffect(() => {
    const k = (e) => {
      if (e.key !== 'Escape') return
      if (latest.current.dlg) setDlg(false)
      else latest.current.leave()
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [])

  const actions = (
    <>
      <button className="btn wh ic-out" onClick={() => submit(true)}>Save</button>
      <button className="btn dark" onClick={() => submit(false)}>Add purchase</button>
    </>
  )
  return (
    <>
      <FlowLayout L={L} title="Add a purchase" onBack={leave} backLabel="Back to purchases" actions={actions} form={<PurchaseForm d={d} set={set} err={err} toast={toast} />} preview={<ReceiptPreview />} />
      {dlg && (
        <div className="dlg">
          <div className="bx" role="alertdialog" aria-labelledby="pfdlg">
            <h3 id="pfdlg">Discard changes?</h3>
            <p>Your new purchase hasn’t been saved.</p>
            <div className="bt">
              <button className="btn" onClick={() => setDlg(false)}>Keep editing</button>
              <button className="btn dark" onClick={onClose}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
