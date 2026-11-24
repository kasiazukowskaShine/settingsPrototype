import { useLayoutEffect, useRef, useState } from 'react'

const EASE = 'cubic-bezier(.645,.045,.355,1)' // ease-in-out: the button is already on screen, it just changes shape

/**
 * A button that, on mount, morphs from another button's content: it starts at the width of `from`, eases to its
 * own width, and crossfades the old label out and the new one in. Without `from` it is a plain button.
 */
export default function Morph({ from, children, ...props }) {
  const ref = useRef()
  const [old, setOld] = useState(!!from)

  useLayoutEffect(() => {
    if (!from) return
    const el = ref.current
    const next = el.querySelector('.mo-b')
    const prev = el.querySelector('.mo-a')
    const toW = el.offsetWidth
    const fromW = toW - next.offsetWidth + prev.offsetWidth
    const t = { duration: 280, easing: EASE, fill: 'both' }
    const w = fromW !== toW && el.animate([{ width: fromW + 'px' }, { width: toW + 'px' }], t)
    const out = prev.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(2px)' }], { ...t, duration: 140, easing: 'ease-out' })
    const inn = next.animate([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { ...t, duration: 180, delay: 90, easing: 'ease-out' })
    Promise.all([inn.finished, w && w.finished]).then(() => {
      w && w.cancel()
      setOld(false)
    }, () => {})
    // StrictMode runs this twice: drop the first run's animations so the second measures clean widths.
    return () => [w, out, inn].forEach((a) => a && a.cancel())
  }, [])

  return (
    <button ref={ref} {...props} className={props.className + (old ? ' mo' : '')}>
      {old && (
        <span className="mo-a" aria-hidden="true">
          {from}
        </span>
      )}
      <span className="mo-b">{children}</span>
    </button>
  )
}
