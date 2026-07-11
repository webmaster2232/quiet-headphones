import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion.js'

export default function ScrollProgress() {
  const root = useRef(null)

  useGSAP(
    () => {
      gsap.to('.scroll-progress__fill', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.15,
        },
      })
    },
    { scope: root },
  )

  return (
    <aside ref={root} className="scroll-progress" aria-hidden="true">
      <span className="scroll-progress__label">01</span>
      <span className="scroll-progress__track">
        <span className="scroll-progress__fill" />
      </span>
      <span className="scroll-progress__label">04</span>
    </aside>
  )
}
