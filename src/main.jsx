import '@fontsource-variable/archivo'
import '@fontsource-variable/archivo-narrow'
import '@fontsource/ibm-plex-mono/400.css'
import 'lenis/dist/lenis.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initializeMotionPreference } from './lib/motionPreference.js'
import './styles.css'

initializeMotionPreference()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
