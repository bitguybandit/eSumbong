import { useEffect, useRef } from 'react'

const REVEAL_CLASS = 'reveal-visible'

function observeElement(element, onReveal) {
  if (!element) return undefined

  if (typeof IntersectionObserver === 'undefined') {
    onReveal(element)
    return undefined
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onReveal(entry.target)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  observer.observe(element)
  return observer
}

/**
 * Adds the "reveal-visible" class once the referenced element scrolls into view.
 * @returns {React.RefObject} ref to attach to the element you want to reveal.
 */
export default function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = observeElement(ref.current, (el) => {
      el.classList.add(REVEAL_CLASS)
    })

    return () => {
      if (observer) observer.disconnect()
    }
  }, [])

  return ref
}

/**
 * Creates one ref per item so a list can be revealed with staggered delays.
 * Each ref applies `transition-delay: index * 80ms` on reveal.
 * @param {number} count number of refs to create.
 * @returns {Array<React.RefObject>} refs to attach, in order.
 */
export function useRevealAll(count) {
  const refs = useRef([])

  if (refs.current.length !== count) {
    refs.current = Array.from({ length: count }, (_, i) => refs.current[i] ?? { current: null })
  }

  useEffect(() => {
    const observers = refs.current.map((ref, index) =>
      observeElement(ref.current, (el) => {
        el.style.transitionDelay = `${index * 80}ms`
        el.classList.add(REVEAL_CLASS)
      })
    )

    return () => {
      observers.forEach((observer) => {
        if (observer) observer.disconnect()
      })
    }
  }, [count])

  return refs.current
}
