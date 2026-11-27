import { useSyncExternalStore } from 'react'

// Active prototype variants (1-based), one per prototype, persisted in the URL so a reload keeps them.
//   v -> ?v=  settings information architecture: V1 (per document type) or V2 (one Templates list)
//   i -> ?i=  layout, for both versions (see LAYOUTS below)
//   p -> ?p=  which side the preview sits on (1 right, 2 left)
//   n -> ?n=  the app navbar in create flows and on the invoice page (1 hidden, 2 visible)
const PARAMS = { v: 'v', i: 'i', p: 'p', n: 'n' }
const MAX = { v: 2, i: 3, p: 2, n: 2 } // variants per prototype
const DEF = { v: 2, i: 1, p: 1, n: 1 } // V2 is the current structure, so it opens there
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
 * The layouts, in picker order. Each one says how its two surfaces are built, so the app and the
 * create flows read traits instead of variant numbers:
 *   settings  which settings surface renders  ('three' = full screen, 'modal' = settings nav + content)
 *   sheet     settings opens inset over the dimmed page instead of edge to edge
 *   lumen     the editor from the Figma file (white cards, grey preview), opened in the sheet
 *   flow      create invoice / add a purchase shell ('i3' = header actions + 50/50, 'modal' = bottom bar)
 *   keepNav   create flows sit beside the app navbar instead of covering it
 *   viewNav   same, for the invoice page you land on after finalising
 *   fit       invoice previews (template editor, create invoice, invoice page) size to fit instead of scrolling
 * The navbar setting (?n=) fills in keepNav and viewNav for every layout (create invoice, add a purchase and
 * the invoice page you land on). Ideas 2 and 3 both open settings as an inset modal sheet.
 * V1 uses the same layouts with its own settings pages: `settings` becomes 'one' and `shell` says which frame
 * they render in ('modal' for idea 2, 'i3' for idea 3 and Lumen).
 */
export const LAYOUTS = [
  { id: 'lumen', layout: (nav) => ({ settings: 'three', sheet: true, lumen: true, flow: 'i3', keepNav: nav, viewNav: nav, fit: false }) },
  { id: 'i2', layout: (nav) => ({ settings: 'modal', sheet: true, lumen: false, flow: 'modal', keepNav: nav, viewNav: nav, fit: false }) },
  // idea 3 builds the invoice full screen, then lands on the invoice page inside the app shell
  { id: 'i3', layout: (nav) => ({ settings: 'three', sheet: true, lumen: false, flow: 'i3', keepNav: nav, viewNav: nav, fit: true }) },
]

/** The layout the app should render for the selected version and navbar setting. */
export function useLayout() {
  const v = useVariant('v')
  const i = useVariant('i')
  const n = useVariant('n')
  const l = LAYOUTS[i - 1]
  const nav = n === 2
  const base = l.layout(nav)
  const id = (v === 1 ? 'v1-' : '') + l.id + (nav ? '-nav' : '')
  return { id, ...base, shell: base.settings === 'modal' ? 'modal' : 'i3', settings: v === 1 ? 'one' : base.settings }
}

// Prototype UI (variant pickers) shows in dev, or in a build made with VITE_PROTO=1 (the Pages deploy).
export const PROTO = import.meta.env.DEV || !!import.meta.env.VITE_PROTO
