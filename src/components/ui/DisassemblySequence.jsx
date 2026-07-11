import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const SOURCE_WIDTH = 1672
const SOURCE_HEIGHT = 941

const SLICE_COUNT = 96

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const range = (value, start, end) => clamp((value - start) / (end - start))
const smoothstep = (value) => value * value * (3 - 2 * value)

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function removePaperBackground(image) {
  const buffer = document.createElement('canvas')
  buffer.width = image.naturalWidth
  buffer.height = image.naturalHeight

  const context = buffer.getContext('2d', { willReadFrequently: true })
  context.drawImage(image, 0, 0)

  const pixels = context.getImageData(0, 0, buffer.width, buffer.height)
  const data = pixels.data
  const samples = [
    [data[0], data[1], data[2]],
    [data[(buffer.width - 1) * 4], data[(buffer.width - 1) * 4 + 1], data[(buffer.width - 1) * 4 + 2]],
    [data[(buffer.width * (buffer.height - 1)) * 4], data[(buffer.width * (buffer.height - 1)) * 4 + 1], data[(buffer.width * (buffer.height - 1)) * 4 + 2]],
  ]
  const paper = samples.reduce(
    (sum, color) => sum.map((channel, index) => channel + color[index] / samples.length),
    [0, 0, 0],
  )

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index]
    const green = data[index + 1]
    const blue = data[index + 2]
    const distance = Math.hypot(red - paper[0], green - paper[1], blue - paper[2])
    const brightness = (red + green + blue) / 3
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue)

    const paperDistanceMask = smoothstep(range(distance, 10, 72))
    const neutralPaper =
      smoothstep(range(brightness, 184, 246)) * (1 - smoothstep(range(chroma, 12, 34)))
    const alphaMask = Math.min(paperDistanceMask, 1 - neutralPaper)
    data[index + 3] = Math.round(data[index + 3] * alphaMask)
  }

  context.putImageData(pixels, 0, 0)
  return buffer
}

function drawContained(context, image, canvasWidth, canvasHeight, alpha = 1, scaleBoost = 1) {
  const scale = Math.min(canvasWidth / image.width, canvasHeight / image.height) * scaleBoost
  const width = image.width * scale
  const height = image.height * scale

  context.save()
  context.globalAlpha = alpha
  context.drawImage(image, (canvasWidth - width) / 2, (canvasHeight - height) / 2, width, height)
  context.restore()
}

const DisassemblySequence = forwardRef(function DisassemblySequence(_, forwardedRef) {
  const canvasRef = useRef(null)
  const assembledRef = useRef(null)
  const explodedRef = useRef(null)
  const progressRef = useRef(0)
  const frameRef = useRef(0)
  const dimensionsRef = useRef({ width: 1, height: 1 })
  const [canAnimate, setCanAnimate] = useState(() =>
    window.matchMedia('(min-width: 800px) and (prefers-reduced-motion: no-preference)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 800px) and (prefers-reduced-motion: no-preference)',
    )
    const update = (event) => setCanAnimate(event.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const draw = () => {
    frameRef.current = 0
    const canvas = canvasRef.current
    const assembled = assembledRef.current
    const exploded = explodedRef.current
    if (!canvas || !assembled || !exploded) return

    const context = canvas.getContext('2d')
    const { width, height } = dimensionsRef.current
    const ratio = canvas.width / width
    const progress = clamp(progressRef.current)

    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, width, height)

    const assembledExit = smoothstep(range(progress, 0.14, 0.3))
    context.save()
    context.translate(width / 2, height / 2)
    context.rotate(-0.035 * assembledExit)
    context.scale(1 - assembledExit * 0.14, 1 - assembledExit * 0.14)
    context.translate(-width / 2, -height / 2)
    context.shadowColor = 'rgba(13, 15, 14, 0.16)'
    context.shadowBlur = 28
    context.shadowOffsetY = 18
    drawContained(context, assembled, width, height, 1 - assembledExit, 0.86)
    context.restore()

    const separation = smoothstep(range(progress, 0.18, 0.84))
    const pieceAlpha =
      smoothstep(range(progress, 0.18, 0.32)) *
      (1 - smoothstep(range(progress, 0.86, 0.98)))
    const fit = Math.min(width / SOURCE_WIDTH, height / SOURCE_HEIGHT) * 1.16
    const originY = (height - SOURCE_HEIGHT * fit) / 2

    // The exploded render is warped in thin vertical strips. This reads like a
    // continuous product film while keeping every component edge intact—there
    // are no rectangular crop masks to reveal during the in-between frames.
    const sourceSliceWidth = SOURCE_WIDTH / SLICE_COUNT
    const horizontalOpen = 0.47 + separation * 0.53
    const verticalOpen = 0.9 + separation * 0.1

    context.save()
    context.globalAlpha = pieceAlpha
    for (let slice = 0; slice < SLICE_COUNT; slice += 1) {
      const sourceX = slice * sourceSliceWidth
      const sourceCenter = sourceX + sourceSliceWidth / 2
      const normalized = sourceCenter / SOURCE_WIDTH - 0.5
      const destinationCenter = width / 2 + normalized * SOURCE_WIDTH * fit * horizontalOpen
      const destinationWidth = sourceSliceWidth * fit * horizontalOpen + 1.15
      const lift = (1 - separation) * (46 + Math.cos(normalized * Math.PI) * 30) * fit
      const destinationHeight = SOURCE_HEIGHT * fit * verticalOpen
      const destinationY =
        originY + lift + (SOURCE_HEIGHT * fit - destinationHeight) / 2

      context.drawImage(
        exploded,
        sourceX,
        0,
        sourceSliceWidth + 1,
        SOURCE_HEIGHT,
        destinationCenter - destinationWidth / 2,
        destinationY,
        destinationWidth,
        destinationHeight,
      )
    }
    context.restore()

    const finalAlpha = smoothstep(range(progress, 0.78, 0.98))
    drawContained(context, exploded, width, height, finalAlpha, 1.16)
  }

  const requestDraw = () => {
    if (frameRef.current) return
    frameRef.current = window.requestAnimationFrame(draw)
  }

  useImperativeHandle(
    forwardedRef,
    () => ({
      setProgress(value) {
        progressRef.current = clamp(value)
        requestDraw()
      },
    }),
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canAnimate) return undefined

    let cancelled = false
    let idleId = 0
    let fallbackTimer = 0
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(1, entry.contentRect.width)
      const height = Math.max(1, entry.contentRect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dimensionsRef.current = { width, height }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      requestDraw()
    })

    observer.observe(canvas)

    const prepareSequence = () => {
      Promise.all([
        loadImage('/assets/form01-hero-cutout.png'),
        loadImage('/assets/form01-exploded.webp'),
      ])
        .then(([assembled, exploded]) => {
          if (cancelled) return
          assembledRef.current = assembled
          explodedRef.current = removePaperBackground(exploded)
          canvas.classList.add('is-ready')
          requestDraw()
        })
        .catch(() => {
          canvas.classList.add('has-error')
        })
    }

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(prepareSequence, { timeout: 1200 })
    } else {
      fallbackTimer = window.setTimeout(prepareSequence, 240)
    }

    return () => {
      cancelled = true
      observer.disconnect()
      if (idleId) window.cancelIdleCallback(idleId)
      if (fallbackTimer) window.clearTimeout(fallbackTimer)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    }
  }, [canAnimate])

  return (
    <div className="disassembly-sequence">
      <canvas
        ref={canvasRef}
        className="disassembly-canvas"
        role="img"
        aria-label="FORM/01 headphones separating into the headband, cushions, drivers, frames, and outer shells as the page scrolls"
      />
      <img
        className="disassembly-loading"
        src="/assets/form01-hero-cutout.png"
        alt=""
        width="1586"
        height="992"
      />
      <img
        className="disassembly-fallback"
        src="/assets/form01-exploded.webp"
        alt="Exploded view of the FORM/01 headphones and their individual components"
        width="1672"
        height="941"
        loading="lazy"
      />
    </div>
  )
})

export default DisassemblySequence
