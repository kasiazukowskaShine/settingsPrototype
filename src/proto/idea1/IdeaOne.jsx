import { useEffect, useRef, useState } from 'react'
import { ICONS } from '../../Icon.jsx'
import { clone, newTpl, setP } from '../../data.js'
import ProtoPicker from '../SearchPicker.jsx'
import { useVariant } from '../store.js'
import BrandPage from './BrandPage.jsx'
import PresetsPage from './PresetsPage.jsx'
import DocList from './DocList.jsx'
import DocEditor from './DocEditor.jsx'
import './idea.css'

const NAV = [
  ['brand', 'Logo & branding'],
  ['pay', 'Payments & reminders'],
  ['comp', 'Compliance'],
  ['presets', 'Document presets'],
  ['einv', 'E-invoices'],
  ['inv', 'Invoices'],
  ['quo', 'Quotes'],
]
const TITLE = { inv: 'Invoices', quo: 'Quotes' }

const DEFAULT_BRAND = {
  logo: null,
  logoName: '',
  font: 'Open Sans',
  color: '#2F50E1',
  apply: { header: true, columnHeaders: true, lines: true, total: true },
}
const DEFAULT_PRESETS = { language: 'French', currency: 'EUR', itemType: 'Product', terms: '30 days', contact: { first: '', last: '', email: '', phone: '' } }

function initial() {
  const inv = newTpl('Invoice defaults', true)
  const quo = newTpl('Quote defaults', true)
  quo.quo.same = false // a quote template carries its own settings in this structure
  return { docs: { inv: [inv], quo: [quo] }, presets: DEFAULT_PRESETS, brand: DEFAULT_BRAND }
}

// Kept outside React so what was saved survives closing and reopening the modal.
let cache = null

/** Idea 1: each document type has its own template list; branding and presets are their own pages. */
export default function IdeaOne({ toast, onClose }) {
  const [saved, setSaved] = useState(() => cache || initial())
  const [page, setPage] = useState('brand')
  const [E, setE] = useState(null) // template editor: { type, mode, draft, orig }
  const [bDraft, setBDraft] = useState(saved.brand)
  const [pDraft, setPDraft] = useState(saved.presets)
  const [dlg, setDlg] = useState(null)
  const mcol = useRef(null)

  useEffect(() => {
    cache = saved
  }, [saved])

  const editorDirty = !!E && JSON.stringify(E.draft) !== JSON.stringify(E.orig)
  const brandDirty = JSON.stringify(bDraft) !== JSON.stringify(saved.brand)
  const presetsDirty = JSON.stringify(pDraft) !== JSON.stringify(saved.presets)
  const dirty = E ? editorDirty : page === 'brand' ? brandDirty : page === 'presets' ? presetsDirty : false

  const resetDrafts = () => {
    setBDraft(saved.brand)
    setPDraft(saved.presets)
  }

  const askDiscard = (next) => {
    if (!dirty) return next()
    setDlg({
      title: 'Discard changes?',
      msg: E ? (E.mode === 'create' ? 'Your new template hasn’t been saved.' : `Changes to “${E.orig.name}” haven’t been saved.`) : 'Your changes haven’t been saved.',
      cancel: 'Keep editing',
      ok: 'Discard',
      run: () => {
        resetDrafts()
        next()
      },
    })
  }

  const go = (p) =>
    askDiscard(() => {
      setE(null)
      setPage(p)
      if (mcol.current) mcol.current.scrollTop = 0
    })
  const backToList = () => setE(null)

  const openEditor = (type, id) => {
    const t = saved.docs[type].find((x) => x.id === id)
    setE({ type, mode: 'edit', draft: clone(t), orig: clone(t) })
    if (mcol.current) mcol.current.scrollTop = 0
  }
  // `from` is the template to copy settings from (the defaults editor passes what is on screen).
  const openCreate = (type, from) => {
    const t = from ? clone(from) : newTpl('', false)
    t.id = newTpl('', false).id
    t.name = ''
    t.isDef = false
    t.updated = 'just now'
    t.quo.same = false
    setE({ type, mode: 'create', fromDefaults: !!from, draft: t, orig: clone(t) })
    if (mcol.current) mcol.current.scrollTop = 0
  }

  // With only the default template, Invoices/Quotes show its settings directly instead of a list.
  // Variant 2 ("start from a template") always shows the list, even with just the default template.
  const entry = useVariant('d')
  const isDocPage = page === 'inv' || page === 'quo'
  const onlyDefault = isDocPage && entry === 1 && saved.docs[page].length === 1
  useEffect(() => {
    if (onlyDefault && !E) {
      const t = saved.docs[page][0]
      setE({ type: page, mode: 'edit', defaults: true, draft: clone(t), orig: clone(t) })
    } else if (entry === 2 && E?.defaults) {
      setE(null) // switched away from the defaults page: land on the list
    }
  }, [onlyDefault, entry, E, page, saved.docs])

  const set = (path, val) =>
    setE((e) => {
      const d = clone(e.draft)
      setP(d, path, val)
      return { ...e, draft: d }
    })

  const saveTemplate = () => {
    const d = clone(E.draft)
    d.name = d.name.trim()
    if (!d.name) return
    d.updated = 'just now'
    const type = E.type
    let list = E.mode === 'create' ? [...saved.docs[type], d] : saved.docs[type].map((x) => (x.id === d.id ? d : x))
    if (d.isDef) list = list.map((x) => ({ ...x, isDef: x.id === d.id }))
    if (!list.some((x) => x.isDef)) list[0] = { ...list[0], isDef: true }
    setSaved({ ...saved, docs: { ...saved.docs, [type]: list } })
    if (E.mode === 'create') {
      toast('Template saved.')
      backToList()
    } else {
      toast('Template saved. Changes apply to new documents.')
      setE({ ...E, draft: clone(d), orig: clone(d) })
    }
  }

  const deleteTemplate = () => {
    if (E.mode === 'create') return askDiscard(backToList)
    setDlg({
      title: 'Delete template?',
      msg: `“${E.orig.name}” will be deleted. This can’t be undone.`,
      cancel: 'Cancel',
      ok: 'Delete',
      danger: true,
      run: () => {
        const type = E.type
        let list = saved.docs[type].filter((x) => x.id !== E.orig.id)
        if (!list.some((x) => x.isDef) && list.length) list[0] = { ...list[0], isDef: true }
        setSaved({ ...saved, docs: { ...saved.docs, [type]: list } })
        toast('Template deleted.')
        backToList()
      },
    })
  }

  const saveBrand = () => {
    setSaved({ ...saved, brand: bDraft })
    toast('Branding saved.')
  }
  const savePresets = () => {
    setSaved({ ...saved, presets: pDraft })
    toast('Presets saved.')
  }

  // Escape closes the innermost layer: dialog, then the editor, then the settings.
  const latest = useRef()
  latest.current = { dlg, E, askDiscard, onClose }
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      const s = latest.current
      if (s.dlg) setDlg(null)
      else if (s.E) s.askDiscard(() => setE(null))
      else s.askDiscard(s.onClose)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const shared = { brand: saved.brand, presets: saved.presets }
  let body
  if (E) {
    body = (
      <DocEditor
        E={E}
        dirty={editorDirty}
        canDelete={E.mode === 'create' || saved.docs[E.type].length > 1}
        title={TITLE[E.type]}
        defaults={!!E.defaults}
        hideDelete={!!E.fromDefaults}
        onCreate={() => openCreate(E.type, E.draft)}
        set={set}
        onBack={() => askDiscard(backToList)}
        onSave={saveTemplate}
        onDelete={deleteTemplate}
        {...shared}
      />
    )
  } else if (page === 'brand') {
    body = <BrandPage draft={bDraft} setDraft={setBDraft} dirty={brandDirty} onSave={saveBrand} onDiscard={() => setBDraft(saved.brand)} presets={saved.presets} />
  } else if (page === 'presets') {
    body = <PresetsPage draft={pDraft} setDraft={setPDraft} dirty={presetsDirty} onSave={savePresets} onDiscard={() => setPDraft(saved.presets)} brand={saved.brand} />
  } else if (onlyDefault) {
    body = null // the defaults editor is set up by the effect above
  } else if (isDocPage) {
    body = <DocList type={page} title={TITLE[page]} list={saved.docs[page]} onOpen={(id) => openEditor(page, id)} onCreate={() => openCreate(page)} {...shared} />
  } else {
    body = (
      <div className="ph-page">
        <h2>{NAV.find((n) => n[0] === page)[1]}</h2>
        <p>This page is not part of the prototype.</p>
      </div>
    )
  }

  return (
    <>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Settings">
        <aside className="snav">
          <h3>Settings</h3>
          <div className="sgrp">
            {ICONS.receipt()}Documents{ICONS.chevDown('ch')}
          </div>
          {NAV.map(([key, label]) => (
            <button key={key} className={'sit' + (page === key ? ' on' : '')} onClick={() => go(key)}>
              {label}
            </button>
          ))}
        </aside>
        <section className="mcol" ref={mcol}>
          <div id="view">{body}</div>
        </section>
        <button className="xbtn" onClick={() => askDiscard(onClose)} aria-label="Close settings">
          {ICONS.close()}
        </button>
      </div>

      {dlg && (
        <div className="dlg">
          <div className="bx" role="alertdialog" aria-labelledby="idlgt">
            <h3 id="idlgt">{dlg.title}</h3>
            <p>{dlg.msg}</p>
            <div className="bt">
              <button className="btn" onClick={() => setDlg(null)}>
                {dlg.cancel}
              </button>
              <button
                className={'btn dark' + (dlg.danger ? ' danger' : '')}
                onClick={() => {
                  const run = dlg.run
                  setDlg(null)
                  run()
                }}
              >
                {dlg.ok}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProtoPicker kind="i" />
      {isDocPage && !(E && !E.defaults) && <ProtoPicker kind="d" stacked />}
    </>
  )
}
