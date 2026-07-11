import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'

export default function HomePage() {
  return <main><Hero />
    <section className="editorial-intro cutout-top">
      <p className="eyebrow mono">FORM/01 / Personal listening</p>
      <h2>Quiet is not the absence of sound.<br />It is space for what matters.</h2>
      <div className="editorial-intro__grid">
        <p>Built around a precision acoustic system and a pressure-balanced frame, FORM/01 turns noise into room to think.</p>
        <Link className="text-link" to="/design">Explore the design <span>→</span></Link>
      </div>
    </section>
    <section className="home-dark-panel">
      <span className="mono">A quieter architecture</span>
      <h2>Every part earns<br />its place.</h2>
      <img src="/assets/form01-exploded.webp" alt="Exploded FORM/01 headphone components" />
      <Link className="light-link" to="/design">Watch it come apart <span>→</span></Link>
    </section>
  </main>
}
