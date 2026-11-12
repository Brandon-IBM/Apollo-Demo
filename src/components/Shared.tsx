import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function LabMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`lab-mark ${small ? 'small' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="18" cy="18" rx="14" ry="6.5" transform="rotate(-45 18 18)" />
        <ellipse cx="18" cy="18" rx="14" ry="6.5" transform="rotate(45 18 18)" />
        <circle cx="18" cy="18" r="1.8" fill="currentColor" stroke="none" />
      </svg>
    </span>
  )
}

export function Modal({
  title,
  eyebrow,
  children,
  onClose,
}: {
  title: string
  eyebrow: string
  children: ReactNode
  onClose: () => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    container.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
      if (event.key !== 'Tab') return
      const controls = container.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, [tabindex="0"]',
      )
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === container.current)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === container.current)
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={container}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}
