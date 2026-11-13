import { useSyncExternalStore } from 'react'

// Active prototype variants (1-based), one per prototype, persisted in the URL so a reload keeps them.
//   i -> ?i=  settings structure (Idea 1 vs Idea 2)
//   l -> ?l=  layout: preview left vs right
//   d -> ?d=  Idea 1 Invoices/Quotes entry: create from default vs start from a template
const PARAMS = { i: 'i', d: 'd', l: 'l' }
const params = new URLSearchParams(location.search)
const state = {}
const MAX = { i: 2, d: 2, l: 2 } // variants per prototype
for (const k of Object.keys(PARAMS)) state[k] = Math.min(MAX[k], Math.max(1, parseInt(params.get(PARAMS[k]), 10) || 1))
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

// Prototype UI (variant pickers) shows in dev, or in a build made with VITE_PROTO=1 (the Pages deploy).
export const PROTO = import.meta.env.DEV || !!import.meta.env.VITE_PROTO
