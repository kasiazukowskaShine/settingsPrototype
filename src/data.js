export const MSG = 'Nous vous remercions de votre confiance. Veuillez trouver ci-dessous le détail de nos prestations.'
export const FOOT = "Veuillez noter que la date d'échéance ne peut être modifiée."
export const SK = ['cols', 'refs', 'discLevel', 'discType', 'message', 'footer', 'tcOn', 'tc']
export const TYL = { general: 'General', inv: 'Invoice', quo: 'Quote' }

export const FIELDS = [
  { id: 'name', label: 'Template name', syn: 'name', types: ['general'] },
  { id: 'default', label: 'Set as default', syn: 'default', types: ['general'] },
  { id: 'language', label: 'Language', syn: 'locale french english german spanish italian', types: ['general'] },
  { id: 'currency', label: 'Currency', syn: 'eur usd gbp euro dollar pound money', types: ['general'] },
  { id: 'itemType', label: 'Item type', syn: 'product service items', types: ['general'] },
  { id: 'terms', label: 'Payment terms', syn: 'due days net payment deadline', types: ['general'] },
  { id: 'contact', label: 'Contact person', syn: 'first last name email phone number', types: ['general'] },
  { id: 'title', label: 'Document title', syn: 'invoice title quote title heading', types: ['inv', 'quo'] },
  { id: 'valid', label: 'Default quote validity', syn: 'validity expiry expires valid', types: ['quo'] },
  { id: 'cols', label: 'Item columns', syn: 'columns date quantity qty unit price vat total totals excluding including', types: ['inv', 'quo'], sh: 1 },
  { id: 'refs', label: 'Reference fields', syn: 'po purchase order buyer customer id reference', types: ['inv', 'quo'], sh: 1 },
  { id: 'disc', label: 'Discounts', syn: 'discount percentage', types: ['inv', 'quo'], sh: 1 },
  { id: 'message', label: 'Default message', syn: 'greeting intro note text', types: ['inv', 'quo'], sh: 1 },
  { id: 'footer', label: 'Footer note', syn: 'footnote', types: ['inv', 'quo'], sh: 1 },
  { id: 'tc', label: 'Terms and conditions', syn: 't&c tc conditions legal', types: ['inv', 'quo'], sh: 1 },
  { id: 'approval', label: 'Before invoice approval', syn: 'approval review message', types: ['inv'] },
]

export const clone = (o) => JSON.parse(JSON.stringify(o))
export const getP = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o)
export function setP(o, p, v) {
  const a = p.split('.')
  const l = a.pop()
  a.reduce((x, k) => x[k], o)[l] = v
}
const pick = (o, ks) => Object.fromEntries(ks.map((k) => [k, o[k]]))
export const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const shared = () => ({
  cols: { date: true, qty: true, unit: true, price: true, vat: true, totalEx: true, totalInc: true },
  refs: { po: true, ref: true, cust: true },
  discLevel: 'None',
  discType: 'Percentage (%)',
  message: MSG,
  footer: FOOT,
  tcOn: false,
  tc: '',
})

let uid = 1
export function newTpl(name, isDef) {
  const inv = { ...shared(), title: 'Invoice', approval: false }
  const quo = { ...shared(), title: 'Quote', validOn: true, valid: '30 days', same: true }
  const presets = { language: 'French', currency: 'EUR', itemType: 'Product', terms: '30 days', contact: { first: '', last: '', email: '', phone: '' } }
  return { id: uid++, name, isDef: !!isDef, updated: 'today', inv, quo, presets }
}

/** Effective settings for a document type, resolving "same as invoice" for quotes. */
export function eff(t, type) {
  if (type === 'inv') return { ...t.inv, presets: t.presets, kind: 'inv' }
  const q = t.quo
  const base = q.same ? pick(t.inv, SK) : pick(q, SK)
  return { ...base, title: q.title, validOn: q.validOn, valid: q.valid, presets: t.presets, kind: 'quo' }
}

export function searchSettings(q, templates) {
  const t = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!t.length) return []
  const tt = []
  const ft = []
  t.forEach((w) => {
    const m = w.length > 2 && templates.some((x) => x.name.toLowerCase().split(/\s+/).some((p) => p.indexOf(w) === 0))
    ;(m ? tt : ft).push(w)
  })
  const out = []
  const def = templates.find((x) => x.isDef) || templates[0]
  let scopeT = def
  const nameMatch = (x) => tt.every((w) => x.name.toLowerCase().indexOf(w) > -1)
  if (tt.length) templates.forEach((x) => { if (nameMatch(x)) scopeT = x })
  if (!ft.length && tt.length) {
    templates.forEach((x) => {
      if (nameMatch(x)) out.push({ title: x.name, path: 'Templates', tpl: x.id, tab: 'inv', tag: x.isDef ? 'Default' : '' })
    })
    return out
  }
  FIELDS.forEach((f) => {
    const hay = (f.label + ' ' + f.syn).toLowerCase()
    if (!ft.every((w) => hay.indexOf(w) > -1)) return
    f.types.forEach((ty) => {
      const fid = f.id === 'title' ? ty + '-title' : f.sh ? ty + '-' + f.id : f.id
      const r = {
        title: f.id === 'title' ? (ty === 'inv' ? 'Invoice title' : 'Quote title') : f.label,
        path: 'Templates › ' + scopeT.name + ' › ' + TYL[ty],
        tpl: scopeT.id,
        tab: ty,
        field: fid,
      }
      if (f.sh && ty === 'quo' && scopeT.quo.same) {
        r.field = 'same'
        r.tag = 'Uses invoice defaults'
      }
      out.push(r)
    })
  })
  return out.slice(0, 8)
}
