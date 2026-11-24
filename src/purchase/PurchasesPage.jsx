import Icon from '../Icon.jsx'

const GEAR = 'M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z'

/** Expenses > Purchases: empty state with a create button, then a simple list once something has been added. */
export default function PurchasesPage({ purchases, onCreate, onNA }) {
  return (
    <main className="main">
      <div className="top">
        <h1>Purchases</h1>
        <div className="acts">
          <button className="icon-btn" onClick={onNA} aria-label="Open settings">
            <Icon>
              <circle cx="12" cy="12" r="3" />
              <path d={GEAR} />
            </Icon>
          </button>
          {purchases.length > 0 && (
            <button className="btn dark" onClick={onCreate}>Create purchase</button>
          )}
        </div>
      </div>
      {purchases.length === 0 ? (
        <div className="pp-empty">
          <div className="pp-ill" aria-hidden="true">
            <Icon>
              <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
              <path d="M9 16h3" stroke="#c0392b" />
            </Icon>
          </div>
          <h2>No purchases</h2>
          <p>No expenses in your business? Do share your strategy with us 😉</p>
          <button className="btn dark pp-cta" onClick={onCreate}>
            <Icon>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </Icon>
            Create purchase
          </button>
        </div>
      ) : (
        <div className="tablewrap">
          <table className="tb">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Supplier</th>
                <th>Date</th>
                <th className="r">Amount incl. VAT</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p, i) => (
                <tr key={i}>
                  <td>{p.ref}</td>
                  <td>{p.supplier}</td>
                  <td>{p.date}</td>
                  <td className="r">{p.amount}</td>
                  <td>{p.draft ? 'Draft' : 'To approve'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
