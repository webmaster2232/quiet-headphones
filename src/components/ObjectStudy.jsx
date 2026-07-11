import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion.js'
import { shouldReduceMotion } from '../lib/motionPreference.js'
import DisassemblyVideo from './ui/DisassemblyVideo.jsx'

const callouts = [
  {
    number: '01',
    title: 'Cold-forged frame',
    body: 'Machined steel carries the load without adding bulk.',
    className: 'callout--frame',
  },
  {
    number: '02',
    title: 'Memory foam seal',
    body: 'Slow-rebound foam disappears on contact.',
    className: 'callout--seal',
  },
  {
    number: '03',
    title: 'Woven pressure band',
    body: 'Tension-balanced mesh distributes pressure evenly.',
    className: 'callout--band',
  },
]

function Callout({ number, title, body, className }) {
  return (
    <article className={`object-callout ${className}`}>
      <span className="mono object-callout__number">{number}</span>
      <h3>{title}</h3>
      <span className="object-callout__rule" />
      <p className="mono">{body}</p>
    </article>
  )
}

export default function ObjectStudy() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const sequenceRef = useRef(null)

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
              '.object-callout, .object-heading, .object-vertical-word',
              { clearProps: 'all', autoAlpha: 1 },
            )
            sequenceRef.current?.setProgress(1)
            return
          }

          const sequence = { progress: 0 }
          sequenceRef.current?.setProgress(0)
          gsap.set('.object-callout', { autoAlpha: 0, y: 22 })
          gsap.set('.object-callout__rule', { scaleX: 0, transformOrigin: 'left center' })

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: '+=320%',
              pin: stageRef.current,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })

          timeline
            .fromTo(
              '.object-heading',
              { autoAlpha: 0, yPercent: 50 },
              { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: 'power3.out' },
            )
            .to(
              sequence,
              {
                progress: 1,
                duration: 2.55,
                ease: 'none',
                onUpdate: () => sequenceRef.current?.setProgress(sequence.progress),
              },
              0.48,
            )
            .from(
              '.object-vertical-word',
              { xPercent: 60, autoAlpha: 0, duration: 0.8, ease: 'power3.out' },
              2.18,
            )
            .to(
              '.object-callout',
              { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.28 },
              2.36,
            )
            .to(
              '.object-callout__rule',
              { scaleX: 1, duration: 0.45, stagger: 0.28 },
              2.48,
            )
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="object-study" id="object" aria-labelledby="object-title">
      <div ref={stageRef} className="object-stage">
        <div className="chapter-label mono">02 / Material study</div>
        <h2 className="object-heading" id="object-title">
          Built from silence.
        </h2>

        <div className="object-product-wrap">
          <DisassemblyVideo ref={sequenceRef} />
        </div>

        <div className="object-callouts">
          <span className="object-mobile-chapter mono">02 / Material study</span>
          {callouts.map((callout) => (
            <Callout key={callout.number} {...callout} />
          ))}
        </div>

        <p className="object-orbit mono">Scrub to separate</p>
        <div className="object-vertical-word" aria-hidden="true">
          Form
        </div>
      </div>
    </section>
  )
}
