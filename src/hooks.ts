import { useCallback, useEffect, useRef, useState } from 'react'

export const SLIDE_DURATION = 12_000
export const DEMO_PHASES = [0, 1_100, 2_200, 3_400, 4_600]
export type AgentId = 'credit' | 'reporting' | 'compliance'
export const agentIds: AgentId[] = ['credit', 'reporting', 'compliance']

function initialSlide() {
  const index = agentIds.indexOf(window.location.hash.slice(1) as AgentId)
  return Math.max(0, index)
}

export function useDemoCarousel() {
  const [index, setIndex] = useState(initialSlide)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [visible, setVisible] = useState(() => !document.hidden)
  const time = useRef(0)

  useEffect(() => {
    const visibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])

  useEffect(() => {
    if (!playing || !visible) return
    let previous = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      time.current += now - previous
      previous = now
      if (time.current >= SLIDE_DURATION) {
        time.current %= SLIDE_DURATION
        setIndex((current) => (current + 1) % agentIds.length)
      }
      setElapsed(time.current)
    }, 100)
    return () => window.clearInterval(timer)
  }, [playing, visible])

  useEffect(() => {
    window.history.replaceState(null, '', `#${agentIds[index]}`)
  }, [index])

  const select = useCallback((next: number) => {
    time.current = 0
    setElapsed(0)
    setIndex((next + agentIds.length) % agentIds.length)
  }, [])

  const replay = useCallback(() => {
    time.current = 0
    setElapsed(0)
    setPlaying(true)
  }, [])

  return {
    index,
    id: agentIds[index],
    elapsed,
    phase: DEMO_PHASES.filter((threshold) => elapsed >= threshold).length - 1,
    playing,
    select,
    replay,
    pause: () => setPlaying(false),
    toggle: () => setPlaying((value) => !value),
  }
}

export type DemoCarousel = ReturnType<typeof useDemoCarousel>
