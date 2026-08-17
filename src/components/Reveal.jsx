import { useEffect, useRef, useState } from 'react'

// Scale-in entrance for a widget: starts hidden, animates in the first
// time it scrolls into view (or immediately if already visible on
// load). Unlike the design lab's repeatable demo, this only plays once
// per mount — widgets shouldn't vanish and replay every time you
// scroll past them during normal use.
export default function Reveal({ children }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={'dk-reveal' + (inView ? ' dk-reveal--in' : '')}>
      {children}
    </div>
  )
}
