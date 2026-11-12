import { useEffect, useMemo, useRef, useState } from 'react'
import Icon, { ICONS } from './Icon.jsx'
import TemplateList from './TemplateList.jsx'
import TemplateEditor from './TemplateEditor.jsx'
import { clone, newTpl, searchSettings, setP } from './data.js'
// PROTO:search-spotlight start
import SpotlightSearch from './proto/SpotlightSearch.jsx'
import { useVariant, PROTO } from './proto/store.js'
// PROTO:search-spotlight end
// PROTO:create-steps start
import ProtoPicker from './proto/SearchPicker.jsx'
import { StepsNav, StepsEditor } from './proto/StepsCreate.jsx'
// PROTO:create-steps end

const PAGES = ['Logo & branding', 'Payments & reminders', 'Compliance', 'E-invoices']

export default function SettingsModal({ templates, setTemplates, toast, onClose }) {
  const protoVariant = useVariant('s') // PROTO:search-spotlight
  const createVariant = useVariant('c') // PROTO:create-steps
  const [view, setView] = useState('list') // list | edit | create | page
  const [page, setPage] = useState('')
  const [hover, setHover] = useState(0)
  const [pvList, setPvList] = useState('inv')
  const [E, setE] = useState(null)
  const [focusField, setFocusField] = useState(null)
  const [dlg, setDlg] = useState(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [ddOpen, setDdOpen] = useState(false)
  const mcol = useRef(null)

  const dirty = !!E && JSON.stringify(E.draft) !== JSON.stringify(E.orig)
  const results = useMemo(() => searchSettings(query, templates), [query, templates])
  const showDD = ddOpen && query.trim() !== ''

  const askDiscard = (next) => {
    if (!dirty) return next()
    setDlg({
      msg: E.mode === 'create' ? 'Your new template hasn’t been saved.' : `Changes to “${E.orig.name}” haven’t been saved.`,
      next,
    })
  }

  const backToList = () => {
    setE(null)
    setView('list')
  }

  const openCreate = () => {
    const t = newTpl('', false)
    t.updated = 'just now'
    setE({ mode: 'create', draft: t, orig: clone(t), tab: 'general', pv: 'inv', err: false })
    setView('create')
  }

  const openEditor = (id, tab, fieldId) => {
    const t = templates.find((x) => x.id === id)
    const keep = E && E.mode === 'edit' && E.draft.id === id
    const base = keep ? E : { mode: 'edit', draft: clone(t), orig: clone(t), tab: 'inv', pv: 'inv', err: false }
    const nt = tab || base.tab || 'inv'
    setE({ ...base, tab: nt, pv: nt !== 'general' ? nt : base.pv })
    setView('edit')
    if (mcol.current) mcol.current.scrollTop = 0
    setFocusField(fieldId ? { id: fieldId, n: Date.now() } : null)
  }

  const set = (path, val) =>
    setE((e) => {
      const d = clone(e.draft)
      setP(d, path, val)
      return { ...e, draft: d, err: path === 'name' && val.trim() ? false : e.err }
    })

  const setTab = (tab) => setE((e) => ({ ...e, tab, pv: tab !== 'general' ? tab : e.pv }))
  const setPv = (pv) => setE((e) => ({ ...e, pv }))

  const paste = (p) => {
    const o = p === 'inv' ? 'quo' : 'inv'
    const d = clone(E.draft)
    const src = o === 'quo' && d.quo.same ? d.inv : d[o]
    d[p].tc = src.tc
    d[p].tcOn = true
    setE({ ...E, draft: d })
    toast('Terms copied from ' + (o === 'inv' ? 'invoices' : 'quotes'))
  }

  const save = () => {
    const d = clone(E.draft)
    if (!d.name.trim()) {
      setE({ ...E, err: true, tab: 'general' })
      return
    }
    d.name = d.name.trim()
    d.updated = 'just now'
    let next = E.mode === 'create' ? [...templates, clone(d)] : templates.map((x) => (x.id === d.id ? clone(d) : x))
    if (d.isDef) next = next.map((x) => ({ ...x, isDef: x.id === d.id }))
    if (!next.some((x) => x.isDef)) next[0] = { ...next[0], isDef: true }
    setTemplates(next)
    if (E.mode === 'create') {
      toast('Template saved. It now appears when you create a document.')
      setHover(next.length - 1)
      backToList()
    } else {
      toast('Template saved. Changes apply to new documents.')
      setE({ ...E, draft: clone(d), orig: clone(d) })
    }
  }

  const gotoRes = (r) => {
    const go = () => {
      setQuery('')
      setDdOpen(false)
      if (E && E.draft.id !== r.tpl) setE(null)
      openEditor(r.tpl, r.tab, r.field)
    }
    if (E && E.draft.id !== r.tpl && dirty) askDiscard(go)
    else go()
  }

  // Escape closes the innermost layer: dialog, search dropdown, editor, then the modal.
  const latest = useRef()
  latest.current = { dlg, showDD, view, askDiscard, backToList, onClose }
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      const s = latest.current
      if (s.dlg) setDlg(null)
      else if (s.showDD) {
        setQuery('')
        setDdOpen(false)
      } else if (s.view === 'edit' || s.view === 'create') s.askDiscard(s.backToList)
      else s.askDiscard(s.onClose)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const onSearchKey = (e) => {
    if (e.key === 'ArrowDown' && results.length) {
      setActive((active + 1) % results.length)
      e.preventDefault()
    } else if (e.key === 'ArrowUp' && results.length) {
      setActive((active + results.length - 1) % results.length)
      e.preventDefault()
    } else if (e.key === 'Enter' && results.length) gotoRes(results[active])
  }

  const inTemplates = view !== 'page'
  const protoSteps = PROTO && view === 'create' && createVariant === 1 // PROTO:create-steps

  return (
    <>
      <div className={'modal' + (view === 'create' && !protoSteps ? ' focus' : '')} role="dialog" aria-modal="true" aria-label="Settings">
        {/* PROTO:create-steps start */}
        {protoSteps ? <StepsNav E={E} setTab={setTab} /> : (
        <aside className="snav">
          <h3>Settings</h3>
          {/* PROTO:search-spotlight start */}
          {PROTO && protoVariant === 2 ? (
            <SpotlightSearch templates={templates} onPick={gotoRes} />
          ) : (
          <div className="sinp">
            {ICONS.search()}
            <input
              placeholder="Search"
              autoComplete="off"
              aria-label="Search settings"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
                setDdOpen(true)
              }}
              onKeyDown={onSearchKey}
              onFocus={() => setDdOpen(true)}
              onBlur={() => setTimeout(() => setDdOpen(false), 120)}
            />
          </div>
          )}
          {/* PROTO:search-spotlight end */}
          <div className="sgrp">
            {ICONS.receipt()}Documents{ICONS.chevDown('ch')}
          </div>
          {PAGES.map((p) => (
            <button
              key={p}
              className={'sit' + (view === 'page' && page === p ? ' on' : '')}
              onClick={() =>
                askDiscard(() => {
                  setE(null)
                  setPage(p)
                  setView('page')
                })
              }
            >
              {p}
            </button>
          ))}
          <button className={'sit' + (inTemplates ? ' on' : '')} onClick={() => askDiscard(backToList)}>
            Templates
          </button>
        </aside>
        )}
        {/* PROTO:create-steps end */}

        <section className="mcol" ref={mcol}>
          <div id="view">
            {view === 'page' && (
              <div className="ph-page">
                <h2>{page}</h2>
                <p>This page is not part of the prototype. Use Templates in the left menu.</p>
              </div>
            )}
            {view === 'list' && (
              <TemplateList
                templates={templates}
                hover={hover}
                setHover={setHover}
                pvList={pvList}
                setPvList={setPvList}
                onOpen={openEditor}
                onCreate={openCreate}
              />
            )}
            {/* PROTO:create-steps start */}
            {protoSteps && E && (
              <StepsEditor
                E={E}
                set={set}
                setTab={setTab}
                onPaste={paste}
                onBack={() => askDiscard(backToList)}
                onSave={save}
                onNameError={() => setE((e) => ({ ...e, err: true }))}
              />
            )}
            {/* PROTO:create-steps end */}
            {(view === 'edit' || (view === 'create' && !protoSteps)) && E && (
              <TemplateEditor
                E={E}
                dirty={dirty}
                set={set}
                setTab={setTab}
                setPv={setPv}
                onPaste={paste}
                onBack={() => askDiscard(backToList)}
                onSave={save}
                focusField={focusField}
              />
            )}
          </div>
        </section>

        <button className="xbtn" onClick={() => askDiscard(onClose)} aria-label="Close settings">
          {ICONS.close()}
        </button>

        {showDD && (
          <div
            className="dd"
            role="listbox"
            onMouseDown={(e) => {
              e.preventDefault()
              const row = e.target.closest('.row')
              if (row) gotoRes(results[+row.dataset.i])
            }}
          >
            {results.length === 0 ? (
              <div className="none">No results for “{query}”. Try “footer”, “message”, or a template name.</div>
            ) : (
              results.map((r, i) => (
                <div key={i} className={'row' + (i === active ? ' on' : '')} data-i={i} role="option">
                  <div>
                    <b>{r.title}</b>
                    <span>{r.path}</span>
                  </div>
                  {r.tag && <span className="tag">{r.tag}</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* PROTO:create-steps start */}
      {PROTO && <ProtoPicker kind="i" />}
      {PROTO && (view === 'list' || view === 'create') && <ProtoPicker kind={view === 'create' ? 'c' : 's'} stacked />}
      {/* PROTO:create-steps end */}

      {dlg && (
        <div className="dlg">
          <div className="bx" role="alertdialog" aria-labelledby="dlgt">
            <h3 id="dlgt">Discard changes?</h3>
            <p>{dlg.msg}</p>
            <div className="bt">
              <button className="btn" onClick={() => setDlg(null)}>
                Keep editing
              </button>
              <button
                className="btn dark"
                onClick={() => {
                  const next = dlg.next
                  setDlg(null)
                  next()
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
