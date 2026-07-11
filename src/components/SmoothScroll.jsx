import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import { gsap, ScrollTrigger } from '../lib/motion.js'

function ScrollTriggerSync() {
  const sync = useCallback(() => ScrollTrigger.update(), [])
  const lenis = useLenis(sync)

  useEffect(() => {
    if (!lenis) return undefined

    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(refreshId)
  }, [lenis])

  return null
}

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setReducedMotion(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000)

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [])

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        anchors: { offset: 0 },
        duration: reducedMotion ? 0 : 1.15,
        lerp: reducedMotion ? 1 : 0.09,
        smoothWheel: !reducedMotion,
        syncTouch: false,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  )
}
