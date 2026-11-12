import { useState } from 'react'
import Paper, { Thumb } from '../../Paper.jsx'
import { ICONS } from '../../Icon.jsx'
import { eff } from '../../data.js'

/** Template list for one document type (Invoices or Quotes). */
export default function DocList({ type, title, list, onOpen, onCreate, brand, presets }) {
  const [hover, setHover] = useState(0)
  const t = list[hover] || list[0]
  return (
    <>
      <div className="mhead">
        <h2>{title}</h2>
        <button className="btn" onClick={onCreate} style={{ marginRight: 56 }}>
          {ICONS.plus()}Create template
        </button>
      </div>
      <div className="lgrid">
        <div>
          {list.map((x, i) => (
            <button key={x.id} className={'tcard' + (i === hover ? ' on' : '')} onClick={() => onOpen(x.id)} onMouseOver={() => setHover(i)} onFocus={() => setHover(i)}>
              <Thumb />
              <div style={{ minWidth: 0 }}>
                <div className="nm idea-nm">{x.name}</div>
                <div className="su">Last updated {x.updated}</div>
              </div>
              {x.isDef && <span className="bd">Default</span>}
            </button>
          ))}
        </div>
        <aside className="pvp">
          <div className="pvh">
            <span>Live preview</span>
          </div>
          {t && <Paper s={eff({ ...t, presets }, type)} brand={brand} />}
        </aside>
      </div>
    </>
  )
}
