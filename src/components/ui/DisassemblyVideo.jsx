import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { progressToVideoTime } from '../../lib/disassemblyVideo.js'
import { shouldReduceMotion } from '../../lib/motionPreference.js'

const DisassemblyVideo = forwardRef(function DisassemblyVideo(_, forwardedRef) {
  const videoRef = useRef(null)
  const progressRef = useRef(0)
  const durationRef = useRef(4)
  const [canAnimate, setCanAnimate] = useState(
    () => window.matchMedia('(min-width: 800px)').matches && !shouldReduceMotion(),
  )

  const seek = () => {
    const video = videoRef.current
    if (!video || video.readyState < 1) return
    video.currentTime = progressToVideoTime(progressRef.current, durationRef.current)
  }

  useImperativeHandle(
    forwardedRef,
    () => ({
      setProgress(progress) {
        progressRef.current = progress
        seek()
      },
    }),
    [],
  )

  useEffect(() => {
    const widthMedia = window.matchMedia('(min-width: 800px)')
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setCanAnimate(widthMedia.matches && !shouldReduceMotion())
    widthMedia.addEventListener('change', update)
    motionMedia.addEventListener('change', update)
    return () => {
      widthMedia.removeEventListener('change', update)
      motionMedia.removeEventListener('change', update)
    }
  }, [])

  if (!canAnimate) {
    return (
      <img
        className="disassembly-fallback"
        src="/assets/form01-exploded.webp"
        alt="Exploded view of the FORM/01 headphones and their individual components"
        width="1672"
        height="941"
      />
    )
  }

  return (
    <div className="disassembly-sequence">
      <video
        ref={videoRef}
        className="disassembly-video"
        src="/assets/form01-disassembly.mp4"
        poster="/assets/form01-disassembly-poster.webp"
        preload="auto"
        muted
        playsInline
        aria-label="FORM/01 headphones smoothly separating into their mechanical layers as the page scrolls"
        onLoadedMetadata={(event) => {
          durationRef.current = event.currentTarget.duration || 4
          seek()
          event.currentTarget.classList.add('is-ready')
        }}
      />
    </div>
  )
})

export default DisassemblyVideo
