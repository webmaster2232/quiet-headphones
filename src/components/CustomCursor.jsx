import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion.js'
import { shouldReduceMotion } from '../lib/motionPreference.js'

export default function CustomCursor() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (shouldReduceMotion() || !finePointer || !ringRef.current || !dotRef.current) {
      return undefined
    }

    const ringX = gsap.quickTo(ringRef.current, 'x', { duration: 0.38, ease: 'power3' })
    const ringY = gsap.quickTo(ringRef.current, 'y', { duration: 0.38, ease: 'power3' })
    const dotX = gsap.quickTo(dotRef.current, 'x', { duration: 0.08, ease: 'none' })
    const dotY = gsap.quickTo(dotRef.current, 'y', { duration: 0.08, ease: 'none' })

    const onMove = (event) => {
      ringRef.current?.classList.add('is-visible')
      dotRef.current?.classList.add('is-visible')
      ringX(event.clientX)
      ringY(event.clientY)
      dotX(event.clientX)
      dotY(event.clientY)
    }

    const onOver = (event) => {
      const interactive = event.target.closest('a, button, input, [data-cursor]')
      ringRef.current?.classList.toggle('is-active', Boolean(interactive))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
    }
  }, [])

  return (
    <div className="custom-cursor" aria-hidden="true">
      <span ref={ringRef} className="cursor-ring" />
      <span ref={dotRef} className="cursor-dot" />
    </div>
  )
}
