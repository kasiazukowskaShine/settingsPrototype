import Paper, { Thumb } from './Paper.jsx'
import ListLayout from './ListLayout.jsx'
import { eff } from './data.js'

export default function TemplateList({ templates, hover, setHover, pvList, setPvList, onOpen, onCreate, onClose }) {
  const t = templates[hover] || templates[0]
  const preview = (
    <>
      <div className="seg">
        <button className={pvList === 'inv' ? 'on' : ''} onClick={() => setPvList('inv')}>
          Invoice
        </button>
        <button className={pvList === 'quo' ? 'on' : ''} onClick={() => setPvList('quo')}>
          Quote
        </button>
      </div>
      <Paper s={eff(t, pvList)} />
    </>
  )
  return (
    <ListLayout title="Templates" preview={preview} onCreate={onCreate} onClose={onClose}>
      {templates.map((x, i) => (
        <button key={x.id} className={'tcard' + (i === hover ? ' on' : '')} onClick={() => onOpen(x.id, 'inv')} onMouseOver={() => setHover(i)} onFocus={() => setHover(i)}>
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
