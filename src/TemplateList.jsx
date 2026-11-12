import Paper, { Thumb } from './Paper.jsx'
import { ICONS } from './Icon.jsx'
import { eff } from './data.js'

export default function TemplateList({ templates, hover, setHover, pvList, setPvList, onOpen, onCreate }) {
  const t = templates[hover] || templates[0]
  return (
    <>
      <div className="mhead">
        <h2>Templates</h2>
        <button className="btn" onClick={onCreate} style={{ marginRight: 56 }}>
          {ICONS.plus()}Create template
        </button>
      </div>
      <div className="lgrid">
        <div>
          {templates.map((x, i) => (
            <button key={x.id} className={'tcard' + (i === hover ? ' on' : '')} onClick={() => onOpen(x.id, 'inv')} onMouseOver={() => setHover(i)}>
              <Thumb />
              <div>
                <div className="nm">{x.name}</div>
                <div className="su">Last updated {x.updated}</div>
              </div>
              {x.isDef && <span className="bd">Default</span>}
            </button>
          ))}
        </div>
        <aside className="pvp">
          <div className="seg">
            <button className={pvList === 'inv' ? 'on' : ''} onClick={() => setPvList('inv')}>
              Invoice
            </button>
            <button className={pvList === 'quo' ? 'on' : ''} onClick={() => setPvList('quo')}>
              Quote
            </button>
          </div>
          <Paper s={eff(t, pvList)} />
        </aside>
      </div>
    </>
  )
}
