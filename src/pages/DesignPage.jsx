import { Link } from 'react-router-dom'
import ObjectStudy from '../components/ObjectStudy.jsx'

export default function DesignPage() {
  return <main className="inner-page">
    <section className="page-hero design-page-hero"><span className="mono eyebrow">01 / Design</span><h1>Purposeful<br />by design.</h1><p>Every curve, material, and connection exists to serve one thing—your focus.</p><img src="/assets/form01-hero-cutout.png" alt="FORM/01 headphones" /></section>
    <ObjectStudy />
    <section className="chapter-outro cutout-top"><span className="mono eyebrow">Pressure balanced</span><h2>Made to disappear<br />while you listen.</h2><Link className="text-link" to="/sound">Explore sound <span>→</span></Link></section>
  </main>
}
