import { useState } from 'react'
import Paper, { Thumb } from '../../Paper.jsx'
import ListLayout from '../../ListLayout.jsx'
import { eff } from '../../data.js'

/** Template list for one document type (Invoices or Quotes). */
export default function DocList({ type, title, list, onOpen, onCreate, onClose, brand, presets }) {
  const [hover, setHover] = useState(0)
  const t = list[hover] || list[0]
  const preview = t && <Paper s={eff({ ...t, presets }, type)} brand={brand} />
  return (
    <ListLayout title={title} preview={preview} onCreate={onCreate} onClose={onClose}>
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
    </ListLayout>
  )
}
