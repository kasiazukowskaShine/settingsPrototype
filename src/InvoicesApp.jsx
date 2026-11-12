import Icon, { ICONS } from './Icon.jsx'

const KPIS = [
  { cls: '', n: 7, label: 'All Invoices', v: '1.081', c: ',10 EUR' },
  { cls: 'dr', n: 1, label: 'Drafts', v: '100', c: ',50 EUR' },
  { cls: 'up', n: 2, label: 'Unpaid', v: '116', c: ',00 EUR' },
  { cls: 'pd', n: 2, label: 'Paid', v: '120', c: ',00 EUR' },
  { cls: 'ov', n: 1, label: 'Overdue', v: '704', c: ',60 EUR' },
  { cls: '', n: 1, label: 'Cancelled', v: '40', c: ',00 EUR' },
]

const ROWS = [
  ['#f0c400', '2026-06', 'Deposit Invoice', 'Atelier Dumontel', '14/06/2026', '14/07/2026', 'Visual identity', '74,00 EUR'],
  ['#c93a3a', '2026-05', 'Invoice', 'Nova Consulting', '03/06/2026', '03/07/2026', 'Logos', '704,60 EUR'],
  ['#4a7bf0', '—', 'Invoice', 'Éditions Ferrand', '01/06/2026', '27/06/2026', 'Glossy paper', '100,50 EUR'],
  ['#f0c400', '2026-04', 'Invoice', 'Green Loop SAS', '27/05/2026', '27/06/2026', 'Typography', '42,00 EUR'],
  ['#1f9d55', '2026-03', 'Credit note', 'Lumière & Cie', '11/05/2026', '11/06/2026', 'Web design', '63,00 EUR'],
  ['#1f9d55', '2026-02', 'Invoice', 'Marie Larsson', '09/05/2026', '09/06/2026', 'Optimisation UX', '57,00 EUR'],
  ['#a0a6b0', '2026-01', 'Invoice', 'James Burton', '01/04/2026', '-', 'E-commerce', '40,00 EUR', true],
]

const HEADS = ['', 'No.', 'Type', 'Client', 'Date', 'Due date', 'Description', 'Excl. VAT', '']

export default function InvoicesApp({ onSettings, onNA }) {
  return (
    <div className="app">
      <aside className="side">
        <div className="co">
          <b>AB</b>Company_name
        </div>
        <div className="nv">
          <Icon d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />
          Business account
          {ICONS.chevDown('ch')}
        </div>
        <div className="nv">
          <Icon d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
          Invoicing
          {ICONS.chevUp('ch')}
        </div>
        <div className="nv sub on">Invoices</div>
        <div className="nv sub">Quotes</div>
        <div className="nv sub">Items</div>
        <div className="nv sub">Clients</div>
        <div className="nv sub">Supplier e-invoices</div>
        <div className="nv">
          <Icon>
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <path d="M3 10h18" />
          </Icon>
          Team
          {ICONS.chevDown('ch')}
        </div>
        <div className="nv">
          <Icon d="M12 3a9 9 0 109 9h-9z" />
          Reports
          {ICONS.chevDown('ch')}
        </div>
        <div className="nv">
          <Icon d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          Insurance
        </div>
        <div className="nv">
          <Icon d="M8 12l3 3 5-6M3 12l4-4 5 1 5-1 4 4-8 8z" />
          Lending
        </div>
      </aside>
      <main className="main">
        <div className="top">
          <h1>Invoices</h1>
          <div className="acts">
            <button className="icon-btn" onClick={onSettings} aria-label="Open invoicing settings">
              <Icon>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
              </Icon>
            </button>
            <button className="btn" onClick={onNA}>
              Create deposit invoice
            </button>
            <button className="btn dark" onClick={onNA}>
              Create invoice
            </button>
          </div>
        </div>
        <div className="kpis">
          {KPIS.map((k) => (
            <div key={k.label} className={'kpi ' + k.cls}>
              <div className="l">
                <span className="n">{k.n}</span>
                {k.label}
              </div>
              <div className="v">
                {k.v}
                <small>{k.c}</small>
              </div>
            </div>
          ))}
        </div>
        <div className="listbar">
          <h2>
            All Invoices <span className="cntb">7</span>
          </h2>
          <div className="search">
            {ICONS.search()}
            Search by type, client…
          </div>
        </div>
        <div className="tablewrap">
          <table className="tb">
            <thead>
              <tr>
                {HEADS.map((h, i) => (
                  <th key={i} className={h === 'Excl. VAT' ? 'r' : undefined}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r[1] + r[3]}>
                  <td>
                    <span className="dot" style={{ background: r[0] }} />
                  </td>
                  {r.slice(1, 7).map((x, i) => (
                    <td key={i}>{x}</td>
                  ))}
                  <td className="r">{r[8] ? <s>{r[7]}</s> : r[7]}</td>
                  <td>···</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <span>10 items per page</span>
          <span>1 – 7 of 7</span>
        </div>
      </main>
    </div>
  )
}
