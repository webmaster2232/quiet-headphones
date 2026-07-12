import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/motion.js'
import { shouldReduceMotion } from '../lib/motionPreference.js'

const labels = { '/': 'Home', '/design': 'Design', '/sound': 'Sound', '/specs': 'Specs' }

export default function PageTransition({ children }) {
  const location = useLocation()
  const overlayRef = useRef(null)
  const pageRef = useRef(null)

  useGSAP(() => {
    window.scrollTo(0, 0)
    if (shouldReduceMotion()) return
    gsap.timeline()
      .set(overlayRef.current, { autoAlpha: 1, clipPath: 'inset(0 0 0 0)' })
      .fromTo('.page-loader__line', { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: 'power3.inOut' })
      .to(overlayRef.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.72, ease: 'power4.inOut' })
      .fromTo(pageRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.62, ease: 'power2.out' }, 0.48)
      .set(overlayRef.current, { autoAlpha: 0 })

    gsap.utils.toArray('.editorial-intro h2, .chapter-outro h2, .listening-modes h2', pageRef.current).forEach((heading) => {
      gsap.fromTo(heading,
        { autoAlpha: 0, y: 54, clipPath: 'inset(0 0 100% 0)' },
        { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power4.out',
          scrollTrigger: { trigger: heading, start: 'top 84%', once: true } },
      )
    })
  }, { dependencies: [location.pathname] })

  return (
    <>
      <div ref={overlayRef} className="page-loader" aria-hidden="true">
        <span>FORM/01</span><span>{labels[location.pathname] || 'FORM/01'}</span>
        <i className="page-loader__line" />
      </div>
      <div ref={pageRef} key={location.pathname}>{children}</div>
    </>
  )
}
