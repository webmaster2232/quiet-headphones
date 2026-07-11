import { useState } from 'react'
import {
  hasFullMotionOverride,
  setFullMotionOverride,
  systemPrefersReducedMotion,
} from '../lib/motionPreference.js'

export default function MotionPreference() {
  const [systemReduced] = useState(systemPrefersReducedMotion)
  const [fullMotion] = useState(hasFullMotionOverride)

  if (!systemReduced) return null

  const setMode = (enabled) => {
    setFullMotionOverride(enabled)
    window.location.reload()
  }

  if (fullMotion) {
    return (
      <button
        className="motion-preference motion-preference--active mono"
        type="button"
        onClick={() => setMode(false)}
        title="Return to the system reduced-motion setting"
      >
        <span className="motion-preference__pulse" />
        Motion / full
      </button>
    )
  }

  return (
    <aside className="motion-preference motion-preference--prompt" role="status">
      <span>
        <strong>Motion is paused</strong>
        <small>Your browser requested reduced motion.</small>
      </span>
      <button className="mono" type="button" onClick={() => setMode(true)}>
        Enable full motion
      </button>
    </aside>
  )
}
