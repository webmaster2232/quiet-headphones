import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap } from '../lib/motion.js'
import { shouldReduceMotion } from '../lib/motionPreference.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function ScrollKinetics() {
  const barRef = useRef(null)
  const valueRef = useRef(null)
  const directionRef = useRef(null)
  const barToRef = useRef(null)
  const headerToRef = useRef(null)

  useEffect(() => {
    const header = document.querySelector('.site-header')
    if (!barRef.current || !header || shouldReduceMotion()) return undefined

    gsap.set(barRef.current, { scaleX: 0.06, transformOrigin: 'left center' })
    barToRef.current = gsap.quickTo(barRef.current, 'scaleX', {
      duration: 0.42,
      ease: 'power3.out',
    })
    headerToRef.current = gsap.quickTo(header, 'y', {
      duration: 0.5,
      ease: 'power3.out',
    })

    return () => {
      gsap.killTweensOf([barRef.current, header])
    }
  }, [])

  useLenis((lenis) => {
    if (shouldReduceMotion()) return

    const velocity = lenis.velocity || 0
    const strength = clamp(Math.abs(velocity) / 34, 0.06, 1)
    barToRef.current?.(strength)
    headerToRef.current?.(clamp(-velocity * 0.22, -8, 8))

    if (valueRef.current) {
      valueRef.current.textContent = String(
        Math.min(999, Math.round(Math.abs(velocity) * 10)),
      ).padStart(3, '0')
    }
    if (directionRef.current) {
      directionRef.current.textContent = velocity < -0.05 ? 'UP' : velocity > 0.05 ? 'DN' : '—'
    }
  })

  return (
    <aside className="scroll-kinetics mono" aria-hidden="true">
      <span>Lenis / velocity</span>
      <span className="scroll-kinetics__track">
        <span ref={barRef} className="scroll-kinetics__bar" />
      </span>
      <span ref={valueRef} className="scroll-kinetics__value">000</span>
      <span ref={directionRef} className="scroll-kinetics__direction">—</span>
    </aside>
  )
}
