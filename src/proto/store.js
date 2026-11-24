import { useSyncExternalStore } from 'react'

// Active prototype variants (1-based), one per prototype, persisted in the URL so a reload keeps them.
//   v -> ?v=  settings information architecture: V1 (per document type) or V2 (one Templates list)
//   i -> ?i=  V2 layout (see LAYOUTS below)
//   d -> ?d=  V1 Invoices/Quotes entry: create from default vs start from a template
//   p -> ?p=  which side the preview sits on (1 right, 2 left)
const PARAMS = { v: 'v', i: 'i', d: 'd', p: 'p' }
const MAX = { v: 2, i: 5, d: 2, p: 2 } // variants per prototype
const DEF = { v: 2, i: 1, d: 1, p: 1 } // V2 is the current structure, so it opens there
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
 *   viewFit   the invoice page sizes its preview to fit, instead of the big scrolling one
 */
export const LAYOUTS = [
  { id: 'lumen', settings: 'three', sheet: false, lumen: true, flow: 'i3', keepNav: false, viewNav: false, viewFit: false },
  { id: 'i2', settings: 'modal', sheet: false, lumen: false, flow: 'modal', keepNav: false, viewNav: false, viewFit: false },
  { id: 'i2b', settings: 'modal', sheet: true, lumen: false, flow: 'modal', keepNav: true, viewNav: true, viewFit: false },
  // idea 3 builds the invoice full screen, then lands on the invoice page inside the app shell
  { id: 'i3', settings: 'three', sheet: true, lumen: false, flow: 'i3', keepNav: false, viewNav: true, viewFit: true },
  { id: 'i3b', settings: 'three', sheet: true, lumen: false, flow: 'i3', keepNav: true, viewNav: true, viewFit: false },
]

// V1 keeps its own settings component and the plain full-screen create flows it shipped with.
const V1 = { id: 'v1', settings: 'one', sheet: false, lumen: false, flow: 'modal', keepNav: false, viewNav: false, viewFit: false }

/** The layout the app should render for the selected version. */
export function useLayout() {
  const v = useVariant('v')
  const i = useVariant('i')
  return v === 1 ? V1 : LAYOUTS[i - 1]
}

// Prototype UI (variant pickers) shows in dev, or in a build made with VITE_PROTO=1 (the Pages deploy).
export const PROTO = import.meta.env.DEV || !!import.meta.env.VITE_PROTO
