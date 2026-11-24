import { useLayoutEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'

const ROWS = [
  ['12.02.25', 'Fahrkarte Super Sparpreis, Berlin Hbf → Offenburg, 2. Klasse, 1 Person', '14,99 €', '7 %', '14,99 €'],
  ['12.02.25', 'Reservierung Berlin Hbf → Offenburg, 1 Person', '0,00 €', '', '0,00 €'],
  ['12.02.25', 'Reservierungsentgelt 2. Klasse', '5,20 €', '7 %', '5,20 €'],
]

/** The uploaded receipt: a scaled mock document with a page / zoom pill under it. */
export default function ReceiptPreview() {
  const wrap = useRef(null)
  const [w, setW] = useState(380)
  const [zoom, setZoom] = useState(100)
  useLayoutEffect(() => {
    const el = wrap.current
    const u = () => el.clientWidth && setW(el.clientWidth)
    u()
    const ro = new ResizeObserver(u)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const s = (w / 380) * (zoom / 100)
  return (
    <div className="rc">
      <div className="pw rc-paper" ref={wrap}>
        <div className="rc-in" style={{ transform: `scale(${s})` }}>
          <div className="rc-logo">DB</div>
          <div className="rc-addr">
            DB Fernverkehr AG
            <br />
            Europa-Allee 78-84
            <br />
            60486 Frankfurt am Main
          </div>
          <div className="rc-to">
            sevDesk GmbH
            <br />
            Elena Vogel
            <br />
            Im Unteren Angel 1<br />
            77652 Offenburg
          </div>
          <div className="rc-box">
            Auftragsnummer: 762493711272
            <br />
            Rechnungsnummer: 2025-762493711272
            <br />
            Rechnungsdatum: 12.02.2025
          </div>
          <h4>Rechnung</h4>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Beschreibung</th>
                <th>Preis</th>
                <th>MwSt</th>
                <th>Brutto</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r[1]}>
                  {r.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="rc-sum">
            Summe (netto) 7 % 18,87 €
            <br />
            zzgl. 7 % MwSt 1,32 €
            <br />
            <b>Summe (brutto) 20,19 €</b>
          </div>
          <div className="rc-note">Dieses Dokument berechtigt nicht zur Fahrt. Mit freundlichen Grüßen, DB Fernverkehr AG</div>
        </div>
      </div>
      <div className="rc-bar" role="group" aria-label="Preview controls">
        <button disabled aria-label="Previous page"><Icon d="M6 15l6-6 6 6" /></button>
        <span>1/3</span>
        <button disabled aria-label="Next page"><Icon d="M6 9l6 6 6-6" /></button>
        <i />
        <button onClick={() => setZoom((z) => Math.max(50, z - 25))} aria-label="Zoom out"><Icon d="M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5M8 11h6" /></button>
        <span>{zoom}%</span>
        <button onClick={() => setZoom((z) => Math.min(200, z + 25))} aria-label="Zoom in"><Icon d="M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5M8 11h6M11 8v6" /></button>
      </div>
    </div>
  )
}
