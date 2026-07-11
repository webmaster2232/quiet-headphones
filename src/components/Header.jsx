import { useLenis } from 'lenis/react'

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M9 4l4 4-4 4" />
    </svg>
  )
}

export default function Header({ onReserve }) {
  const lenis = useLenis()

  const scrollToChapter = (event, selector, offsetScreens = 0) => {
    event.preventDefault()
    event.stopPropagation()
    const target = document.querySelector(selector)
    if (!target) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const offset = window.innerHeight * offsetScreens

    if (lenis) {
      lenis.scrollTo(target, {
        offset,
        duration: reducedMotion ? 0 : 1.25,
        immediate: reducedMotion,
      })
      return
    }

    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY + offset,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="FORM/01 home">
        FORM/01
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        <a href="#object" onClick={(event) => scrollToChapter(event, '#object', 1.65)}>Object</a>
        <a href="#sound" onClick={(event) => scrollToChapter(event, '#sound', 1.15)}>Sound</a>
        <a href="#specs" onClick={(event) => scrollToChapter(event, '#specs')}>Specs</a>
      </nav>
      <button className="reserve-button" type="button" onClick={onReserve}>
        <span>Reserve — $480</span>
        <ArrowIcon />
      </button>
    </header>
  )
}
