import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion.js'
import { shouldReduceMotion } from '../lib/motionPreference.js'
import AnimatedTextCycle from './ui/AnimatedTextCycle.jsx'

const heroWords = ['Quiet,', 'Focused,', 'Aware,', 'Spatial,']

function DownArrow() {
  return (
    <svg viewBox="0 0 18 28" aria-hidden="true">
      <path d="M9 1v24M2 18l7 7 7-7" />
    </svg>
  )
}

export default function Hero() {
  const sectionRef = useRef(null)

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

          if (reduced) {
            gsap.set('.hero-line-inner, .hero-product, .hero-meta', {
              clearProps: 'all',
              autoAlpha: 1,
            })
            return
          }

          const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
          intro
            .from('.hero-line-inner', {
              yPercent: 115,
              duration: 1.15,
              stagger: 0.08,
            })
            .from(
              '.hero-product',
              {
                autoAlpha: 0,
                scale: 0.78,
                rotate: -7,
                duration: 1.45,
              },
              0.12,
            )
            .from(
              '.hero-meta',
              { autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.07 },
              0.65,
            )

          if (desktop) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: 'top top',
                  end: '+=85%',
                  pin: true,
                  scrub: 0.5,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              })
              .to('.hero-line--one', { xPercent: -23, ease: 'none' }, 0)
              .to('.hero-line--two', { xPercent: 17, ease: 'none' }, 0)
              .to(
                '.hero-product',
                { yPercent: 34, scale: 1.2, rotate: 8, ease: 'none' },
                0,
              )
              .to('.hero-meta', { autoAlpha: 0, y: -38, ease: 'none' }, 0)
              .to('.hero-title', { scale: 0.94, transformOrigin: 'center top', ease: 'none' }, 0)
          }
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="hero" id="top" aria-labelledby="hero-title">
      <h1 className="hero-title" id="hero-title">
        <span className="sr-only">Quiet, engineered.</span>
        <span className="hero-line hero-line--one" aria-hidden="true">
          <span className="hero-line-inner">
            <AnimatedTextCycle words={heroWords} interval={2800} />
          </span>
        </span>
        <span className="hero-line hero-line--two" aria-hidden="true">
          <span className="hero-line-inner">engineered.</span>
        </span>
      </h1>

      <img
        className="hero-product"
        src="/assets/form01-hero-cutout.png"
        alt="FORM/01 mineral-sage over-ear headphones with a cobalt woven canopy"
        width="1586"
        height="992"
        fetchPriority="high"
      />

      <div className="hero-meta hero-chapter mono">01 / The object</div>
      <a className="hero-meta hero-scroll mono" href="#object">
        <span>Scroll to disassemble</span>
        <DownArrow />
      </a>
    </section>
  )
}
