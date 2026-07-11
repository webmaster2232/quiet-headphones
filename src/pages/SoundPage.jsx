import { Link } from 'react-router-dom'
import SpatialField from '../components/SpatialField.jsx'

const modes = [['01','Silence','Maximum cancellation for uninterrupted focus.'],['02','Aware','The right sounds enter without breaking your concentration.'],['03','Spatial','A dimensional soundstage that moves with you.']]
export default function SoundPage() {
  return <main className="inner-page sound-page">
    <section className="page-hero sound-page-hero"><span className="mono eyebrow">02 / Sound</span><h1>The room<br />falls away.</h1><p>Precision drivers and adaptive processing reveal every detail at its intended depth.</p><img src="/assets/form01-spatial.webp" alt="Listener wearing FORM/01 headphones" /></section>
    <SpatialField />
    <section className="listening-modes cutout-top"><span className="mono eyebrow">Three ways to hear</span><h2>Choose how the world reaches you.</h2><div className="mode-grid">{modes.map(([n,t,b]) => <article key={n}><span className="mono">{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div><Link className="text-link" to="/specs">View the specifications <span>→</span></Link></section>
  </main>
}
