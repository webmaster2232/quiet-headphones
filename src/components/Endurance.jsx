import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion.js'
import { shouldReduceMotion } from '../lib/motionPreference.js'

const specs = [
  ['Driver', '40 mm'],
  ['Weight', '312 g'],
  ['Codec', '24-bit / 96 kHz'],
  ['Charge', 'USB-C'],
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <path d="M1 8h21M16 2l6 6-6 6" />
    </svg>
  )
}

export default function Endurance({ onReserve }) {
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
          if (reduced) return

          const counter = { value: 0 }
          gsap.to(counter, {
            value: 42,
            ease: 'none',
            scrollTrigger: {
              trigger: '.endurance-top',
              start: 'top 72%',
              end: 'top 18%',
              scrub: true,
            },
            onUpdate: () => {
              const node = sectionRef.current?.querySelector('.endurance-number__value')
              if (node) node.textContent = String(Math.round(counter.value))
            },
          })

          gsap.from('.endurance-product', {
            autoAlpha: 0,
            yPercent: 12,
            rotate: desktop ? 5 : 0,
            scale: 0.88,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.endurance-top',
              start: 'top 70%',
              end: 'top 8%',
              scrub: desktop ? 0.8 : false,
            },
          })

          gsap.from('.spec-row', {
            autoAlpha: 0,
            x: -22,
            stagger: 0.08,
            duration: 0.55,
            scrollTrigger: {
              trigger: '.spec-table',
              start: 'top 80%',
              once: true,
            },
          })

          if (desktop) {
            gsap.from('.purchase-inner', {
              yPercent: 30,
              ease: 'none',
              scrollTrigger: {
                trigger: '.purchase-band',
                start: 'top bottom',
                end: 'top top',
                scrub: true,
              },
            })
          }
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="endurance" id="specs" aria-labelledby="endurance-title">
      <div className="endurance-top">
        <div className="chapter-label mono">04 / Endurance</div>
        <div className="endurance-copy">
          <h2 className="endurance-number" id="endurance-title">
            <span className="endurance-number__value">42</span>
            <span className="endurance-number__unit mono">Hours</span>
          </h2>
          <p className="endurance-statement">One charge. Three days of quiet.</p>
          <dl className="spec-table">
            {specs.map(([label, value]) => (
              <div className="spec-row mono" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <img
          className="endurance-product"
          src="/assets/form01-folded.webp"
          alt="Folded FORM/01 headphones beside their graphite fabric case"
          width="1536"
          height="1024"
          loading="lazy"
        />
      </div>

      <footer className="purchase-band">
        <div className="purchase-inner">
          <div className="purchase-mark">FORM/01</div>
          <div className="purchase-actions">
            <button className="purchase-primary mono" type="button" onClick={onReserve}>
              <span>Reserve — $480</span>
              <ArrowIcon />
            </button>
            <a className="purchase-secondary mono" href="#specs">
              <span>View full specs</span>
              <ArrowIcon />
            </a>
          </div>
          <p className="purchase-foot mono">Designed for deep listening.</p>
          <p className="purchase-code mono">F / 01</p>
        </div>
      </footer>
    </section>
  )
}
