import { useSyncExternalStore } from 'react'

// Active prototype variants (1-based), one per prototype, persisted in the URL so a reload keeps them.
//   v -> ?v=  settings information architecture: V1 (per document type) or V2 (one Templates list)
//   i -> ?i=  V2 layout (see LAYOUTS below)
//   d -> ?d=  V1 Invoices/Quotes entry: create from default vs start from a template
//   p -> ?p=  which side the preview sits on (1 right, 2 left)
//   n -> ?n=  the app navbar in create flows and on the invoice page (1 hidden, 2 visible)
const PARAMS = { v: 'v', i: 'i', d: 'd', p: 'p', n: 'n' }
const MAX = { v: 2, i: 3, d: 2, p: 2, n: 2 } // variants per prototype
const DEF = { v: 2, i: 1, d: 1, p: 1, n: 1 } // V2 is the current structure, so it opens there
const params = new URLSearchParams(location.search)
const state = {}
for (const k of Object.keys(PARAMS)) state[k] = Math.min(MAX[k], Math.max(1, parseInt(params.get(PARAMS[k]), 10) || DEF[k]))
const listeners = new Set()

export function setVariant(key, n) {
  state[key] = n
  const url = new URL(location)
  url.searchParams.set(PARAMS[key], n)
  history.replaceState(null, '', url)
  listeners.forEach((l) => l())
}

export function useVariant(key) {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state[key]
  )
}

/**
 * The V2 layouts, in picker order. Each one says how its two surfaces are built, so the app and the
 * create flows read traits instead of variant numbers:
 *   settings  which settings surface renders  ('three' = full screen, 'modal' = settings nav + content)
 *   sheet     settings opens inset over the dimmed page instead of edge to edge
 *   lumen     the full-page editor from the Figma file (no sheet)
 *   flow      create invoice / add a purchase shell ('i3' = header actions + 50/50, 'modal' = bottom bar)
 *   keepNav   create flows sit beside the app navbar instead of covering it
 *   viewNav   same, for the invoice page you land on after finalising
 *   fit       invoice previews (template editor, create invoice, invoice page) size to fit instead of scrolling
 * The navbar setting (?n=) fills in keepNav and viewNav for every layout (create invoice, add a purchase and
 * the invoice page you land on). Ideas 2 and 3 both open settings as an inset modal sheet.
 */
export const LAYOUTS = [
  { id: 'lumen', layout: (nav) => ({ settings: 'three', sheet: false, lumen: true, flow: 'i3', keepNav: nav, viewNav: nav, fit: false }) },
  { id: 'i2', layout: (nav) => ({ settings: 'modal', sheet: true, lumen: false, flow: 'modal', keepNav: nav, viewNav: nav, fit: false }) },
  // idea 3 builds the invoice full screen, then lands on the invoice page inside the app shell
  { id: 'i3', layout: (nav) => ({ settings: 'three', sheet: true, lumen: false, flow: 'i3', keepNav: nav, viewNav: nav, fit: true }) },
]

// V1 keeps its own settings component and the plain full-screen create flows it shipped with.
const V1 = { id: 'v1', settings: 'one', sheet: false, lumen: false, flow: 'modal', keepNav: false, viewNav: false, fit: false }

/** The layout the app should render for the selected version and navbar setting. */
export function useLayout() {
  const v = useVariant('v')
  const i = useVariant('i')
  const n = useVariant('n')
  if (v === 1) return V1
  const l = LAYOUTS[i - 1]
  const nav = n === 2
  return { id: l.id + (nav ? '-nav' : ''), ...l.layout(nav) }
}

// Prototype UI (variant pickers) shows in dev, or in a build made with VITE_PROTO=1 (the Pages deploy).
export const PROTO = import.meta.env.DEV || !!import.meta.env.VITE_PROTO
