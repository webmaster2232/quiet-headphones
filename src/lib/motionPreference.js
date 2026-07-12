const MOTION_OVERRIDE_KEY = 'form01-motion-override'

export function hasFullMotionOverride() {
  try {
    return window.localStorage.getItem(MOTION_OVERRIDE_KEY) !== 'reduced'
  } catch {
    return false
  }
}

export function systemPrefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function shouldReduceMotion() {
  try {
    return window.localStorage.getItem(MOTION_OVERRIDE_KEY) === 'reduced'
  } catch {
    return false
  }
}

export function initializeMotionPreference() {
  const requestedMode = new URLSearchParams(window.location.search).get('motion')

  try {
    if (requestedMode === 'full') {
      window.localStorage.setItem(MOTION_OVERRIDE_KEY, 'full')
    } else if (requestedMode === 'reduced' || requestedMode === 'system') {
      window.localStorage.setItem(MOTION_OVERRIDE_KEY, 'reduced')
    }
  } catch {
    // Storage can be unavailable in hardened browsing modes; the system setting
    // remains the safe fallback.
  }

  if (requestedMode === 'full' || requestedMode === 'system') {
    const cleanUrl = new URL(window.location.href)
    cleanUrl.searchParams.delete('motion')
    window.history.replaceState(null, '', cleanUrl)
  }

  const mode = shouldReduceMotion() ? 'reduced' : 'full'
  document.documentElement.dataset.motion = mode
  return mode
}

export function setFullMotionOverride(enabled) {
  try {
    if (enabled) window.localStorage.setItem(MOTION_OVERRIDE_KEY, 'full')
    else window.localStorage.setItem(MOTION_OVERRIDE_KEY, 'reduced')
  } catch {
    // The reload below will continue with the system preference if storage fails.
  }
}
