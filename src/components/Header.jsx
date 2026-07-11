import { NavLink } from 'react-router-dom'

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M9 4l4 4-4 4" />
    </svg>
  )
}

export default function Header({ onReserve }) {
  return (
    <header className="site-header">
      <NavLink className="wordmark" to="/" aria-label="FORM/01 home">
        FORM/01
      </NavLink>
      <nav className="primary-nav" aria-label="Primary navigation">
        <NavLink to="/design">Design</NavLink>
        <NavLink to="/sound">Sound</NavLink>
        <NavLink to="/specs">Specs</NavLink>
      </nav>
      <button className="reserve-button" type="button" onClick={onReserve}>
        <span>Reserve — $480</span>
        <ArrowIcon />
      </button>
    </header>
  )
}
