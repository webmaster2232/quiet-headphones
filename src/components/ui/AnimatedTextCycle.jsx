import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const wordVariants = {
  hidden: { y: '-55%', opacity: 0, filter: 'blur(10px)' },
  visible: {
    y: '0%',
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    y: '55%',
    opacity: 0,
    filter: 'blur(10px)',
    transition: { duration: 0.32, ease: [0.7, 0, 0.84, 0] },
  },
}

/**
 * A dependency-light adaptation of the supplied shadcn text-cycle component.
 * It keeps the same animated-width behavior while using this project's CSS system.
 */
export default function AnimatedTextCycle({ words, interval = 3200, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [width, setWidth] = useState('auto')
  const measureRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const safeWords = words?.length ? words : ['']

  useLayoutEffect(() => {
    const measure = measureRef.current?.children[currentIndex]
    if (!measure) return

    setWidth(`${Math.ceil(measure.getBoundingClientRect().width) + 2}px`)
  }, [currentIndex, safeWords])

  useEffect(() => {
    if (prefersReducedMotion || safeWords.length < 2) return undefined

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % safeWords.length)
    }, interval)

    return () => window.clearInterval(timer)
  }, [interval, prefersReducedMotion, safeWords.length])

  useEffect(() => {
    if (currentIndex >= safeWords.length) setCurrentIndex(0)
  }, [currentIndex, safeWords.length])

  return (
    <span className="animated-text-cycle-shell">
      <span ref={measureRef} className="animated-text-cycle-measure" aria-hidden="true">
        {safeWords.map((word) => (
          <span key={word} className={className}>
            {word}
          </span>
        ))}
      </span>

      <motion.span
        className="animated-text-cycle"
        animate={{ width }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 180, damping: 22, mass: 0.9 }
        }
        aria-hidden="true"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className={`animated-text-cycle-word ${className}`}
            variants={prefersReducedMotion ? undefined : wordVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
            exit={prefersReducedMotion ? undefined : 'exit'}
          >
            {safeWords[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  )
}
