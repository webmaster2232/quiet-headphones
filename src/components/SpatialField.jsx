import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/motion.js'
import { shouldReduceMotion } from '../lib/motionPreference.js'

const SpatialGlobe = lazy(() => import('./ui/SpatialGlobe.jsx'))

const modeCopy = {
  focus: 'Adaptive silence maps the room in real time, then leaves only what belongs.',
  aware: 'A transparent layer returns voices and movement without breaking the music.',
}

export default function SpatialField() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const [mode, setMode] = useState('focus')
  const [fieldActive, setFieldActive] = useState(true)
  const [fieldReady, setFieldReady] = useState(false)
  const [fieldVisible, setFieldVisible] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion()) return undefined

    const section = sectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFieldVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          setFieldReady(true)
        }
      },
      { rootMargin: '55% 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: '(min-width: 800px)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop } = context.conditions
          const reduced = shouldReduceMotion()

          if (!desktop || reduced) {
            gsap.set(
              '.spatial-image, .spatial-headline__line, .spatial-copy, .spatial-modes, .field-status',
              { clearProps: 'all', autoAlpha: 1 },
            )
            return
          }

          gsap.set('.spatial-image', {
            clipPath: 'inset(100% 0 0 0)',
            scale: 1.16,
          })
          gsap.set('.spatial-copy, .spatial-modes, .field-status', { autoAlpha: 0, y: 24 })

          gsap
            .timeline({
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: '+=185%',
                pin: stageRef.current,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            .to('.spatial-image', {
              clipPath: 'inset(0% 0 0 0)',
              scale: 1.03,
              duration: 1.1,
              ease: 'power3.inOut',
            })
            .from(
              '.spatial-headline__line--one',
              { xPercent: -52, duration: 1, ease: 'power3.out' },
              0.25,
            )
            .from(
              '.spatial-headline__line--two',
              { xPercent: 48, duration: 1, ease: 'power3.out' },
              0.25,
            )
            .to(
              '.spatial-copy, .spatial-modes, .field-status',
              { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.12 },
              0.72,
            )
            .to(
              '.spatial-image',
              { scale: 1.09, xPercent: 2, duration: 1.1, ease: 'none' },
              1.45,
            )
            .to(
              '.spatial-headline__line--one',
              { xPercent: 8, duration: 1.1, ease: 'none' },
              1.45,
            )
            .to(
              '.spatial-headline__line--two',
              { xPercent: -8, duration: 1.1, ease: 'none' },
              1.45,
            )
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="spatial-field" id="sound" aria-labelledby="spatial-title">
      <div ref={stageRef} className="spatial-stage">
        <div className="spatial-canvas">
          <Suspense fallback={null}>
            {fieldReady ? (
              <SpatialGlobe active={fieldActive && fieldVisible} mode={mode} />
            ) : null}
          </Suspense>
        </div>

        <img
          className="spatial-image"
          src="/assets/form01-spatial.webp"
          alt="Side-profile portrait of a listener wearing FORM/01 headphones"
          width="1536"
          height="1024"
          loading="lazy"
        />

        <div className="spatial-chapter mono">
          <span>FORM/01</span>
          <span>03 / Spatial field</span>
        </div>

        <h2 className="spatial-headline" id="spatial-title">
          <span className="spatial-headline__line spatial-headline__line--one">The room</span>
          <span className="spatial-headline__line spatial-headline__line--two">falls away.</span>
        </h2>

        <p className="spatial-copy mono" aria-live="polite">
          {modeCopy[mode]}
        </p>

        <p className="spatial-orbit-hint mono">Drag field / orbit</p>

        <div className="spatial-modes" aria-label="Listening mode">
          <button
            className={mode === 'focus' ? 'is-active' : ''}
            type="button"
            onClick={() => setMode('focus')}
            aria-pressed={mode === 'focus'}
          >
            <span>01</span>
            <span>Focus</span>
          </button>
          <button
            className={mode === 'aware' ? 'is-active' : ''}
            type="button"
            onClick={() => setMode('aware')}
            aria-pressed={mode === 'aware'}
          >
            <span>02</span>
            <span>Aware</span>
          </button>
        </div>

        <button
          className={`field-status mono ${fieldActive ? 'is-active' : ''}`}
          type="button"
          onClick={() => setFieldActive((active) => !active)}
          aria-pressed={fieldActive}
        >
          <span className="field-status__reticle">
            <span />
          </span>
          Field {fieldActive ? 'active' : 'paused'}
        </button>
      </div>
    </section>
  )
}
