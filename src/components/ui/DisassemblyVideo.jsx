import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { progressToVideoTime, smoothVideoTime } from '../../lib/disassemblyVideo.js'

const DisassemblyVideo = forwardRef(function DisassemblyVideo(_, forwardedRef) {
  const videoRef = useRef(null)
  const progressRef = useRef(0)
  const durationRef = useRef(4)
  const frameRef = useRef(0)
  const displayedTimeRef = useRef(0)

  const seek = () => {
    if (frameRef.current) return
    const tick = () => {
      frameRef.current = 0
      const video = videoRef.current
      if (!video || video.readyState < 1) return
      const target = progressToVideoTime(progressRef.current, durationRef.current)
      const next = smoothVideoTime(displayedTimeRef.current, target)
      displayedTimeRef.current = next
      if (Math.abs(video.currentTime - next) > 1 / 120) video.currentTime = next
      if (next !== target) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
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

  useEffect(() => () => frameRef.current && cancelAnimationFrame(frameRef.current), [])

  return (
    <div className="disassembly-sequence">
      <video
        ref={videoRef}
        className="disassembly-video"
        src="/assets/form01-disassembly.mp4"
        poster="/assets/form01-disassembly-poster.webp"
        preload="auto"
        disablePictureInPicture
        muted
        playsInline
        aria-label="FORM/01 headphones smoothly separating into their mechanical layers as the page scrolls"
        onLoadedMetadata={(event) => {
          durationRef.current = event.currentTarget.duration || 4
          displayedTimeRef.current = event.currentTarget.currentTime
          seek()
          event.currentTarget.classList.add('is-ready')
        }}
      />
    </div>
  )
})

export default DisassemblyVideo
