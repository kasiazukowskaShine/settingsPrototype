import { useEffect, useRef, useState } from 'react'
import Paper, { Thumb } from '../../Paper.jsx'
import { Form } from '../../TemplateEditor.jsx'
import { ICONS } from '../../Icon.jsx'
import SpotlightSearch from '../../SpotlightSearch.jsx'
import { TYL, clone, eff, newTpl, setP } from '../../data.js'
import './idea3.css'

/**
 * Idea 3: settings is a page inside the app shell (the real sidebar stays visible) with a Templates list and a
 * preview panel. Creating or editing a template goes full screen: back arrow + title on the left, Save draft /
 * Create in the header, tabs and form on the left, live preview on the right.
 */
const PAGES = ['Logo & branding', 'Payments & reminders', 'Compliance', 'E-invoices']

export default function IdeaThree({ templates, setTemplates, toast, onClose, lumen = false }) {
  const [E, setE] = useState(null) // { mode, draft, orig, tab, err }
  const [hover, setHover] = useState(0)
  const [dlg, setDlg] = useState(null)
  const [page, setPage] = useState('') // '' = templates list, otherwise a placeholder settings page
  const [hl, setHl] = useState(null)
  const [focusField, setFocusField] = useState(null)
  const nameRef = useRef(null)
  const bodyRef = useRef(null)

  const dirty = !!E && JSON.stringify(E.draft) !== JSON.stringify(E.orig)
  const askDiscard = (next) => {
    if (!dirty) return next()
    setDlg({ msg: E.mode === 'create' ? 'Your new template hasn’t been saved.' : `Changes to “${E.orig.name}” haven’t been saved.`, next })
  }
  const backToList = () => setE(null)

  const openCreate = () => {
    const t = newTpl('', false)
    t.updated = 'just now'
    setE({ mode: 'create', draft: t, orig: clone(t), tab: 'general', err: false })
  }
  const openEdit = (id, tab = 'general', field) => {
    const t = templates.find((x) => x.id === id)
    setE({ mode: 'edit', draft: clone(t), orig: clone(t), tab, err: false })
    setFocusField(field ? { id: field, n: Date.now() } : null)
  }
  const gotoRes = (r) => {
    const go = () => {
      setPage('')
      openEdit(r.tpl, r.tab, r.field)
    }
    if (E && E.draft.id !== r.tpl) askDiscard(go)
    else go()
  }
  // Scroll to and briefly highlight a field reached from settings search.
  useEffect(() => {
    if (!focusField || !E) return
    let off
    const on = setTimeout(() => {
      const el = document.getElementById('f-' + focusField.id)
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      setHl(focusField.id)
      off = setTimeout(() => setHl(null), 1900)
    }, 80)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [focusField])
  const set = (path, val) =>
    setE((e) => {
      const d = clone(e.draft)
      setP(d, path, val)
      return { ...e, draft: d, err: path === 'name' && val.trim() ? false : e.err }
    })
  const setTab = (tab) => {
    setE((e) => ({ ...e, tab }))
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }
  const paste = (p) => {
    const o = p === 'inv' ? 'quo' : 'inv'
    const d = clone(E.draft)
    const src = o === 'quo' && d.quo.same ? d.inv : d[o]
    d[p].tc = src.tc
    d[p].tcOn = true
    setE({ ...E, draft: d })
    toast('Terms copied from ' + (o === 'inv' ? 'invoices' : 'quotes'))
  }

  const save = (asDraft) => {
    const d = clone(E.draft)
    if (!d.name.trim()) {
      setE({ ...E, err: true, tab: 'general' })
      return
    }
    d.name = d.name.trim()
    d.updated = 'just now'
    d.draft = asDraft
    if (asDraft) d.isDef = false
    let next = E.mode === 'create' ? [...templates, d] : templates.map((x) => (x.id === d.id ? d : x))
    if (d.isDef) next = next.map((x) => ({ ...x, isDef: x.id === d.id }))
    if (!next.some((x) => x.isDef)) next[0] = { ...next[0], isDef: true, draft: false }
    setTemplates(next)
    setHover(next.findIndex((x) => x.id === d.id))
    toast(asDraft ? 'Draft saved.' : E.mode === 'create' ? 'Template created. It now appears when you create a document.' : 'Template saved. Changes apply to new documents.')
    backToList()
  }

  useEffect(() => {
    if (E?.err && nameRef.current) nameRef.current.focus()
  }, [E?.err])

  // Escape closes the innermost layer: dialog, editor, then settings.
  const latest = useRef()
  latest.current = { dlg, E, askDiscard, onClose }
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      const s = latest.current
      if (s.dlg) setDlg(null)
      else if (s.E) s.askDiscard(() => setE(null))
      else s.onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const t = templates[hover] || templates[0]
  const pv = E ? (E.tab === 'quo' ? 'quo' : 'inv') : 'inv'
  const isDraftTpl = E?.mode === 'edit' && E.orig.draft

  return (
    <>
      <div className={'i3' + (lumen ? ' lm' : ' sheet') + (E ? ' full' : '')} role="dialog" aria-modal="true" aria-label={E ? 'Template editor' : 'Settings'}>
        {(
          <aside className="snav i3-nav" aria-hidden={E ? 'true' : undefined} inert={!!E}>
            <h3>Settings</h3>
            <SpotlightSearch templates={templates} onPick={gotoRes} />
            <div className="sgrp">
              {ICONS.receipt()}Documents{ICONS.chevDown('ch')}
            </div>
            {PAGES.map((p) => (
              <button key={p} className={'sit' + (page === p ? ' on' : '')} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className={'sit' + (!page ? ' on' : '')} onClick={() => setPage('')}>
              Templates
            </button>
          </aside>
        )}
        <div className="i3-main">
        <header className={'i3-head' + (E ? ' ed' : '')}>
          {E ? (
            <>
              <h2>
                <button className="back" onClick={() => askDiscard(backToList)} aria-label="Back to templates">
                  {ICONS.back()}
                </button>
                <span className="i3-title">{E.mode === 'create' ? 'Create template' : E.orig.name}</span>
              </h2>
              <div className="i3-acts">
                {lumen ? (
                  <>
                    <button className="btn dark" onClick={() => save(false)}>
                      Save template
                    </button>
                    <button className="lv-x" onClick={() => askDiscard(onClose)} aria-label="Close settings">
                      {ICONS.close()}
                    </button>
                  </>
                ) : (
                  <>
                    {(E.mode === 'create' || isDraftTpl) && (
                      <button className="btn" onClick={() => save(true)}>
                        Save draft
                      </button>
                    )}
                    <button className="btn dark" onClick={() => save(false)}>
                      {E.mode === 'create' || isDraftTpl ? 'Create' : 'Save changes'}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2>{page || 'Templates'}</h2>
              <div className="i3-acts">
                {!page && (
                  <button className="btn dark" onClick={openCreate}>
                    Create template
                  </button>
                )}
                <button className="lv-x" onClick={onClose} aria-label="Close settings">
                  {ICONS.close()}
                </button>
              </div>
            </>
          )}
        </header>

        <div className={'i3-body' + (!E && page ? ' solo' : '')} ref={bodyRef}>
          <div className="i3-left">
            {E ? (
              <>
                <div className="i3-card">
                <div className="i3-tabs">
                  <div className="tabs" role="tablist">
                    {['general', 'inv', 'quo'].map((k) => (
                      <button key={k} className={'tab' + (E.tab === k ? ' on' : '')} role="tab" aria-selected={E.tab === k} onClick={() => setTab(k)}>
                        {TYL[k]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="i3-form" key={E.tab}>
                  <Form E={E} set={set} hl={hl} onPaste={paste} nameRef={nameRef} />
                </div>
                </div>
              </>
            ) : page ? (
              <div className="i3-card">
                <div className="ph-page">
                  <p>This page is not part of the prototype. Use Templates in the left menu.</p>
                </div>
              </div>
            ) : (
              <div className="i3-card i3-list">
                {templates.map((x, i) => (
                  <button key={x.id} className={'tcard' + (i === hover ? ' on' : '')} onClick={() => openEdit(x.id)} onMouseOver={() => setHover(i)} onFocus={() => setHover(i)}>
                    <Thumb />
                    <div style={{ minWidth: 0 }}>
                      <div className="nm idea-nm">{x.name}</div>
                      <div className="su">Last updated {x.updated}</div>
                    </div>
                    {x.draft ? <span className="bd dr">Draft</span> : x.isDef && <span className="bd">Default</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {(E || !page) && (
            <aside className="i3-pv" aria-label="Preview">
              <Paper s={eff(E ? E.draft : t, pv)} />
            </aside>
          )}
        </div>
        </div>
      </div>

      {dlg && (
        <div className="dlg">
          <div className="bx" role="alertdialog" aria-labelledby="i3dlgt">
            <h3 id="i3dlgt">Discard changes?</h3>
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
