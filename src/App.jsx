import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import MotionPreference from './components/MotionPreference.jsx'
import PageTransition from './components/PageTransition.jsx'
import ReservationDrawer from './components/ReservationDrawer.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import HomePage from './pages/HomePage.jsx'
import DesignPage from './pages/DesignPage.jsx'
import SoundPage from './pages/SoundPage.jsx'
import SpecsPage from './pages/SpecsPage.jsx'

export default function App() {
  const [reservationOpen, setReservationOpen] = useState(false)

  return (
    <BrowserRouter><SmoothScroll>
      <MotionPreference />
      <Header onReserve={() => setReservationOpen(true)} />
      <PageTransition><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="/sound" element={<SoundPage />} />
        <Route path="/specs" element={<SpecsPage onReserve={() => setReservationOpen(true)} />} />
      </Routes></PageTransition>
      <ReservationDrawer
        open={reservationOpen}
        onClose={() => setReservationOpen(false)}
      />
    </SmoothScroll></BrowserRouter>
  )
}
