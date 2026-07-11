import { useCallback, useEffect, useRef } from 'react'
import createGlobe from 'cobe'
import { shouldReduceMotion } from '../../lib/motionPreference.js'

const soundMarkers = [
  { id: 'voice', location: [8, -8], label: 'Voice / near', labelled: true },
  { id: 'detail', location: [38, -74], label: 'Detail / left' },
  { id: 'space', location: [24, 106], label: 'Space / right' },
  { id: 'ambient', location: [-32, 166], label: 'Ambient / rear', labelled: true },
  { id: 'focus', location: [62, 24], label: 'Focus / axis' },
]

const soundArcs = [
  { id: 'front-left', from: [8, -8], to: [38, -74] },
  { id: 'front-right', from: [8, -8], to: [24, 106] },
  { id: 'rear-right', from: [-32, 166], to: [24, 106] },
  { id: 'focus-front', from: [62, 24], to: [8, -8] },
]

export default function SpatialGlobe({ active = true, mode = 'focus' }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)
  const modeRef = useRef(mode)
  const pointerRef = useRef(null)
  const dragRef = useRef({ phi: 0, theta: 0 })
  const settledRef = useRef({ phi: 0, theta: 0 })
  const wakeRef = useRef(() => {})

  useEffect(() => {
    activeRef.current = active
    wakeRef.current()
  }, [active])

  useEffect(() => {
    modeRef.current = mode
    wakeRef.current()
  }, [mode])

  const endDrag = useCallback(() => {
    if (pointerRef.current) {
      settledRef.current.phi += dragRef.current.phi
      settledRef.current.theta += dragRef.current.theta
    }
    pointerRef.current = null
    dragRef.current = { phi: 0, theta: 0 }
    canvasRef.current?.classList.remove('is-dragging')
    wakeRef.current()
  }, [])

  useEffect(() => {
    const move = (event) => {
      if (!pointerRef.current) return
      dragRef.current = {
        phi: (event.clientX - pointerRef.current.x) / 220,
        theta: (event.clientY - pointerRef.current.y) / 520,
      }
      wakeRef.current()
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', endDrag, { passive: true })
    window.addEventListener('pointercancel', endDrag, { passive: true })

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [endDrag])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || shouldReduceMotion()) return undefined

    let globe
    let frame = 0
    let rotation = 0
    let width = 0
    let appliedWidth = 0
    let appliedPhi = Number.NaN
    let appliedTheta = Number.NaN
    let visible = true
    let previousTime = performance.now()

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wakeRef.current()
    })
    observer.observe(canvas)

    const resizeObserver = new ResizeObserver(([entry]) => {
      width = Math.round(entry.contentRect.width)
      wakeRef.current()
    })
    resizeObserver.observe(canvas)

    const initialise = () => {
      frame = 0
      if (!width) {
        frame = window.requestAnimationFrame(initialise)
        return
      }

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.16,
        dark: 1,
        diffuse: 1.35,
        scale: 1.05,
        mapSamples: 18000,
        mapBrightness: 2.6,
        mapBaseBrightness: 0.04,
        baseColor: [0.33, 0.38, 0.31],
        markerColor: [0.68, 0.73, 0.66],
        glowColor: [0.01, 0.01, 0.01],
        markerElevation: 0.03,
        markers: soundMarkers.map((marker, index) => ({
          id: marker.id,
          location: marker.location,
          size: index === 0 ? 0.055 : 0.025,
        })),
        arcs: soundArcs,
        arcColor: [0.18, 0.26, 0.78],
        arcWidth: 0.65,
        arcHeight: 0.28,
      })
      appliedWidth = width

      canvas.classList.add('is-ready')

      const animate = (time) => {
        frame = 0
        const frameScale = Math.min(3, (time - previousTime) / (1000 / 60))
        previousTime = time

        if (visible && activeRef.current && !pointerRef.current) {
          rotation += (modeRef.current === 'focus' ? 0.0022 : 0.0042) * frameScale
        }

        if (visible) {
          const phi = rotation + settledRef.current.phi + dragRef.current.phi
          const theta = Math.max(
            -0.65,
            Math.min(0.65, 0.16 + settledRef.current.theta + dragRef.current.theta),
          )
          const resized = width && width !== appliedWidth
          const update = {
            phi,
            theta,
          }

          if (resized) {
            update.width = width
            update.height = width
            appliedWidth = width
          }

          if (resized || phi !== appliedPhi || theta !== appliedTheta) {
            globe.update(update)
            appliedPhi = phi
            appliedTheta = theta
          }
        }

        if (visible && (activeRef.current || pointerRef.current)) {
          frame = window.requestAnimationFrame(animate)
        }
      }

      wakeRef.current = () => {
        if (frame || !globe || !visible) return
        previousTime = performance.now()
        frame = window.requestAnimationFrame(animate)
      }
      wakeRef.current()
    }

    initialise()

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      wakeRef.current = () => {}
      window.cancelAnimationFrame(frame)
      globe?.destroy()

      // Cobe v2 wraps the canvas to host its CSS anchors but leaves the wrapper
      // behind. Restore the React-owned DOM so StrictMode can safely replay effects.
      const cobeWrapper = canvas.parentElement
      const reactParent = cobeWrapper?.parentElement
      if (cobeWrapper && reactParent && !cobeWrapper.classList.contains('spatial-globe')) {
        reactParent.insertBefore(canvas, cobeWrapper)
        cobeWrapper.remove()
      }
    }
  }, [])

  const handlePointerDown = (event) => {
    pointerRef.current = { x: event.clientX, y: event.clientY }
    canvasRef.current?.classList.add('is-dragging')
    wakeRef.current()
  }

  const handleKeyDown = (event) => {
    const amount = event.shiftKey ? 0.2 : 0.08
    if (event.key === 'ArrowLeft') settledRef.current.phi -= amount
    else if (event.key === 'ArrowRight') settledRef.current.phi += amount
    else if (event.key === 'ArrowUp') settledRef.current.theta -= amount
    else if (event.key === 'ArrowDown') settledRef.current.theta += amount
    else return
    event.preventDefault()
    wakeRef.current()
  }

  return (
    <div className="spatial-globe">
      <canvas
        ref={canvasRef}
        className="spatial-globe__canvas"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        role="img"
        aria-label="Interactive spatial listening field. Drag or use arrow keys to rotate."
      />

      {soundMarkers.filter((marker) => marker.labelled).map((marker) => (
        <span
          key={marker.id}
          className="spatial-globe__marker mono"
          style={{
            positionAnchor: `--cobe-${marker.id}`,
            '--marker-visible': `var(--cobe-visible-${marker.id}, 0)`,
          }}
          aria-hidden="true"
        >
          {marker.label}
        </span>
      ))}
    </div>
  )
}
