import { useState } from 'react'
import CustomCursor from './components/CustomCursor.jsx'
import Endurance from './components/Endurance.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import MotionPreference from './components/MotionPreference.jsx'
import ObjectStudy from './components/ObjectStudy.jsx'
import ReservationDrawer from './components/ReservationDrawer.jsx'
import ScrollKinetics from './components/ScrollKinetics.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import SpatialField from './components/SpatialField.jsx'

export default function App() {
  const [reservationOpen, setReservationOpen] = useState(false)

  return (
    <SmoothScroll>
      <CustomCursor />
      <ScrollProgress />
      <ScrollKinetics />
      <MotionPreference />
      <Header onReserve={() => setReservationOpen(true)} />
      <main>
        <Hero />
        <ObjectStudy />
        <SpatialField />
        <Endurance onReserve={() => setReservationOpen(true)} />
      </main>
      <ReservationDrawer
        open={reservationOpen}
        onClose={() => setReservationOpen(false)}
      />
    </SmoothScroll>
  )
}
