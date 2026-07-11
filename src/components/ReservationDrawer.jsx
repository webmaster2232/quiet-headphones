import { useEffect, useRef, useState } from 'react'

const colors = [
  { id: 'mineral', label: 'Mineral', hex: '#8f9588' },
  { id: 'graphite', label: 'Graphite', hex: '#262827' },
  { id: 'cobalt', label: 'Cobalt', hex: '#334be7' },
]

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  )
}

export default function ReservationDrawer({ open, onClose }) {
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)
  const successRef = useRef(null)
  const [color, setColor] = useState('mineral')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const pageHeader = document.querySelector('.site-header')
    const pageMain = document.querySelector('main')
    previousFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    if (pageHeader) pageHeader.inert = true
    if (pageMain) pageMain.inert = true
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        panelRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panelRef.current?.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      if (pageHeader) pageHeader.inert = false
      if (pageMain) pageMain.inert = false
      window.removeEventListener('keydown', onKeyDown)
      requestAnimationFrame(() => previousFocusRef.current?.focus())
    }
  }, [onClose, open])

  useEffect(() => {
    if (!open) setSubmitted(false)
  }, [open])

  useEffect(() => {
    if (open && submitted) successRef.current?.focus()
  }, [open, submitted])

  const submitReservation = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return open ? (
    <aside className="reservation" role="dialog" aria-modal="true" aria-labelledby="reserve-title">
      <button className="reservation-backdrop" type="button" onClick={onClose} aria-label="Close reservation" />
      <div ref={panelRef} className="reservation-panel">
        <div className="reservation-header">
          <span className="mono">FORM/01 / Reserve</span>
          <button ref={closeRef} className="reservation-close" type="button" onClick={onClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </button>
        </div>

        {submitted ? (
          <div ref={successRef} className="reservation-success" tabIndex="-1" aria-live="polite">
            <span className="mono">Position held</span>
            <h2 id="reserve-title">You&apos;re in the quiet.</h2>
            <p>We&apos;ll send your private order link when the first edition is ready.</p>
            <button className="text-link mono" type="button" onClick={onClose}>
              Return to FORM/01
            </button>
          </div>
        ) : (
          <form className="reservation-form" onSubmit={submitReservation}>
            <div>
              <p className="mono">First edition / 1,000 units</p>
              <h2 id="reserve-title">Reserve your FORM/01.</h2>
            </div>

            <img
              src="/assets/form01-hero-cutout.png"
              alt="FORM/01 headphones in mineral"
              width="1586"
              height="992"
            />

            <fieldset className="color-picker">
              <legend className="mono">Finish</legend>
              {colors.map((item) => (
                <label key={item.id} className={color === item.id ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="finish"
                    value={item.id}
                    checked={color === item.id}
                    onChange={() => setColor(item.id)}
                  />
                  <span className="color-swatch" style={{ '--swatch': item.hex }} />
                  <span>{item.label}</span>
                </label>
              ))}
            </fieldset>

            <label className="email-field mono">
              <span>Email</span>
              <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
            </label>

            <button className="reservation-submit mono" type="submit">
              Hold my place — $0 today
            </button>
            <p className="reservation-note mono">No charge until your private order window opens.</p>
          </form>
        )}
      </div>
    </aside>
  ) : null
}
