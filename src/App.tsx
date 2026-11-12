import { useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Info, Pause, Play, RotateCcw } from 'lucide-react'
import { AgentPreview, agents } from './components/AgentPreview'
import { Modal } from './components/Shared'
import { SLIDE_DURATION, useDemoCarousel } from './hooks'
import type { AgentId } from './hooks'

export default function App() {
  const carousel = useDemoCarousel()
  const [dialog, setDialog] = useState<'about' | 'discussion' | null>(null)
  const [reviews, setReviews] = useState<Record<AgentId, boolean>>({
    credit: false,
    reporting: false,
    compliance: false,
  })
  const openDialog = (type: 'about' | 'discussion') => {
    carousel.pause()
    setDialog(type)
  }
  const replay = () => {
    setReviews((current) => ({ ...current, [carousel.id]: false }))
    carousel.replay()
  }

  return (
    <div className="landing-page minimal-page">
      <a className="skip-link" href="#demo-showcase">
        Skip to demo
      </a>
      <main>
        <section className="hero shell" aria-labelledby="hero-heading">
          <h1 id="hero-heading">
            AI agents for
            <br />
            <span>investment operations.</span>
          </h1>
          <button className="pill-button header-discuss" onClick={() => openDialog('discussion')}>
            Let’s discuss
            <ArrowUpRight size={14} />
          </button>
        </section>
        <section
          className="showcase shell"
          id="demo-showcase"
          tabIndex={-1}
          aria-roledescription="carousel"
          aria-label="Three illustrative agent workflows"
          onKeyDown={(event) => {
            if ((event.target as HTMLElement).closest('button,[role="tablist"],[role="dialog"]'))
              return
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              carousel.select(carousel.index + 1)
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault()
              carousel.select(carousel.index - 1)
            }
          }}
        >
          <div className={`demo-stage ${carousel.playing ? 'is-playing' : 'is-paused'}`}>
            <div className="stage-topline">
              <span>
                <span className="stage-dot" />
                Illustrative workflow simulation · Synthetic data
              </span>
            </div>
            <div
              key={carousel.id}
              className="slide-content"
              role="group"
              aria-roledescription="slide"
              aria-label={`${carousel.index + 1} of 3: ${agents[carousel.index].title}`}
            >
              <AgentPreview
                index={carousel.index}
                phase={carousel.phase}
                reviewed={reviews[carousel.id]}
                onReview={() => setReviews((current) => ({ ...current, [carousel.id]: true }))}
                onInteract={carousel.pause}
              />
            </div>
          </div>
          <div className="showcase-controls">
            <div className="slide-tabs" role="tablist" aria-label="Select agent demo">
              {agents.map((agent, index) => (
                <button
                  id={`agent-tab-${index}`}
                  key={agent.id}
                  role="tab"
                  aria-selected={carousel.index === index}
                  aria-controls="active-demo-description"
                  tabIndex={carousel.index === index ? 0 : -1}
                  className={carousel.index === index ? 'active' : ''}
                  onClick={() => carousel.select(index)}
                  onKeyDown={(event) => {
                    const next =
                      event.key === 'ArrowRight'
                        ? (index + 1) % 3
                        : event.key === 'ArrowLeft'
                          ? (index + 2) % 3
                          : event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? 2
                              : -1
                    if (next >= 0) {
                      event.preventDefault()
                      carousel.select(next)
                      document.getElementById(`agent-tab-${next}`)?.focus()
                    }
                  }}
                >
                  <span className="slide-tab-label">{agent.short}</span>
                  <span className="tab-progress">
                    <span
                      style={{
                        width:
                          carousel.index === index
                            ? `${(carousel.elapsed / SLIDE_DURATION) * 100}%`
                            : '0%',
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>
            <div className="playback-controls">
              <button
                className="icon-button playback-toggle"
                onClick={carousel.toggle}
                aria-label={carousel.playing ? 'Pause slideshow' : 'Play slideshow'}
                title={carousel.playing ? 'Pause' : 'Play'}
              >
                {carousel.playing ? (
                  <Pause size={13} fill="currentColor" />
                ) : (
                  <Play size={13} fill="currentColor" />
                )}
              </button>
              <button
                className="icon-button"
                onClick={replay}
                aria-label="Replay demo"
                title="Replay"
              >
                <RotateCcw size={14} />
              </button>
              <button
                className="icon-button"
                aria-label="Previous agent"
                title="Previous agent"
                onClick={() => carousel.select(carousel.index - 1)}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="icon-button"
                aria-label="Next agent"
                title="Next agent"
                onClick={() => carousel.select(carousel.index + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
          <p
            className="sr-only"
            id="active-demo-description"
            role="tabpanel"
            aria-labelledby={`agent-tab-${carousel.index}`}
            aria-live="off"
          >
            {agents[carousel.index].title}. All data is synthetic.{' '}
            {carousel.playing ? 'Advances every twelve seconds.' : 'Slideshow paused.'}
          </p>
        </section>
      </main>
      <footer className="site-footer shell">
        <button className="footer-about" onClick={() => openDialog('about')}>
          About
          <Info size={12} />
        </button>
      </footer>
      {dialog && (
        <Modal
          title={dialog === 'about' ? 'About this demo' : 'What’s worth solving?'}
          eyebrow={dialog === 'about' ? 'INDEPENDENT EXPLORATION' : 'LET’S DISCUSS'}
          onClose={() => setDialog(null)}
        >
          {dialog === 'about' ? (
            <>
              <p className="modal-intro">
                Three concepts based on public research, not validated Apollo requirements.
                Synthetic records and local comparisons; no live AI or client systems. Review
                actions stay in this session. Not an official Apollo or IBM offering.
              </p>
              <p className="modal-copy">
                Production requires business validation, approved data access, security controls,
                integration design, and human approval.
              </p>
            </>
          ) : (
            <ol className="discovery-questions">
              <li>
                <span>01</span>
                <p>Which manual workflows take the most time?</p>
              </li>
              <li>
                <span>02</span>
                <p>What AI tools exist, and where are the gaps?</p>
              </li>
              <li>
                <span>03</span>
                <p>Where could additional engineering capacity help?</p>
              </li>
            </ol>
          )}
        </Modal>
      )}
    </div>
  )
}
