import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GitCompareArrows,
  LoaderCircle,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'
import {
  analyzeCompliance,
  analyzeCredit,
  analyzeReporting,
  complianceRecords,
  creditRecords,
  money,
  reportingRecords,
} from '../data'
import type { AgentId } from '../hooks'
import { Modal } from './Shared'

export const agents = [
  {
    id: 'credit' as const,
    short: 'Credit servicing',
    title: 'Private Credit Servicing Agent',
    subtitle: 'From payment notice to a review-ready exception.',
    icon: FileCheck2,
    files: ['Payment notice', 'Servicing ledger', 'Loan terms'],
    refs: ['NTC-2026-0930', 'LDG-2026-0930 · Row 12', 'AGR-2026-0415 · § 4.2'],
    steps: ['Read notice', 'Match records', 'Compare terms', 'Flag discrepancy', 'Prepare report'],
    metric: money(analyzeCredit().difference),
    finding: 'Payment shortfall',
    findingText: 'Interest is $25,000 below the contractual amount.',
  },
  {
    id: 'reporting' as const,
    short: 'Reporting QA',
    title: 'Investor Reporting QA Agent',
    subtitle: 'Two sources. One investment. A clearer answer.',
    icon: GitCompareArrows,
    files: ['Portfolio report', 'Reporting extract', 'Comparison summary'],
    refs: ['RPT-2026-Q3 · Row 18', 'EXT-2026-Q3 · Row 18', 'SYN-NIF-018 · Q3 2026'],
    steps: ['Read report', 'Match extract', 'Compare values', 'Flag mismatch', 'Prepare review'],
    metric: money(analyzeReporting().difference),
    finding: 'Valuation mismatch',
    findingText: '$48.2M vs. $47.9M. Investigate the difference.',
  },
  {
    id: 'compliance' as const,
    short: 'Compliance',
    title: 'Investment Compliance Agent',
    subtitle: 'A defined restriction. An evidence-backed review.',
    icon: ShieldCheck,
    files: ['Investment restriction', 'Portfolio exposure', 'Review summary'],
    refs: ['POL-SYN-015 · § 3.1', 'EXP-2026-Q3 · Row 7', 'Hypothetical concentration check'],
    steps: [
      'Read restriction',
      'Check exposure',
      'Compare limit',
      'Flag exception',
      'Prepare review',
    ],
    metric: `${analyzeCompliance().excess.toFixed(1)} pp`,
    finding: 'Potential concentration exception',
    findingText: '17.2% exposure vs. a hypothetical 15% limit.',
  },
]

export function AgentPreview({
  index,
  phase,
  reviewed,
  onReview,
  onInteract,
}: {
  index: number
  phase: number
  reviewed: boolean
  onReview: () => void
  onInteract: () => void
}) {
  const agent = agents[index]
  const [source, setSource] = useState(0)
  const [evidence, setEvidence] = useState(false)
  const complete = phase >= 4
  const findingVisible = phase >= 3
  useEffect(() => {
    if (phase === 0) setSource(0)
    else if (phase < 3) setSource(Math.min(phase, 2))
  }, [phase, index])
  const selectSource = (next: number) => {
    setSource(next)
    onInteract()
  }

  return (
    <div className="demo-window" aria-label={agent.title}>
      <div className="window-chrome">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>{agent.title}</span>
      </div>
      <div className="window-body">
        <aside className="demo-sidebar">
          <div className="sidebar-label">Sources</div>
          <div className="source-navigation" role="tablist" aria-label="Source documents">
            {agent.files.map((file, fileIndex) => (
              <button
                key={file}
                id={`file-tab-${fileIndex}`}
                role="tab"
                tabIndex={source === fileIndex ? 0 : -1}
                aria-selected={source === fileIndex}
                aria-controls="source-preview"
                className={source === fileIndex ? 'selected' : ''}
                onClick={() => selectSource(fileIndex)}
                onKeyDown={(event) => {
                  const next =
                    event.key === 'ArrowRight' || event.key === 'ArrowDown'
                      ? (fileIndex + 1) % 3
                      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                        ? (fileIndex + 2) % 3
                        : -1
                  if (next >= 0) {
                    event.preventDefault()
                    selectSource(next)
                    document.getElementById(`file-tab-${next}`)?.focus()
                  }
                }}
              >
                {fileIndex === 1 ? <FileSpreadsheet size={14} /> : <FileText size={14} />}
                <span>{file}</span>
                {source === fileIndex && <ChevronRight size={12} />}
              </button>
            ))}
          </div>
        </aside>
        <section
          className="source-pane"
          id="source-preview"
          role="tabpanel"
          aria-labelledby={`file-tab-${source}`}
          tabIndex={0}
        >
          <div className="pane-header">
            <span>
              <FileText size={13} />
              {agent.files[source]}
            </span>
            <span className="source-format">{source === 1 ? 'XLSX' : 'PDF'}</span>
          </div>
          <div className="source-canvas">
            <div className="source-paper" key={`${index}-${source}`}>
              <div className="paper-top">
                <span className="paper-symbol">
                  {index === 0 ? 'MIH' : index === 1 ? 'NIF' : 'POL'}
                </span>
                <span>SYNTHETIC</span>
              </div>
              <SourceRecord id={agent.id} source={source} phase={phase} />
              <div className="paper-footnote">
                {agent.refs[source]}
                <span>01</span>
              </div>
            </div>
          </div>
        </section>
        <section className="activity-pane" aria-label="Agent activity">
          <div className="pane-header">
            <span>
              <ScanLine size={14} />
              Analysis
            </span>
            <span className={`activity-status ${complete ? 'finished' : ''}`}>
              <span />
              {complete ? 'Complete' : 'Processing'}
            </span>
          </div>
          <div className="activity-content">
            <ol className="activity-steps">
              {agent.steps.map((step, stepIndex) => {
                const done = stepIndex < phase || complete
                const active = stepIndex === phase && !complete
                return (
                  <li key={step} className={done ? 'done' : active ? 'working' : ''}>
                    <span className="activity-node">
                      {done ? (
                        <Check size={11} />
                      ) : active ? (
                        <LoaderCircle className="spin" size={12} />
                      ) : (
                        <span />
                      )}
                    </span>
                    <span>{step}</span>
                    {done && <span className="activity-done">✓</span>}
                  </li>
                )
              })}
            </ol>
            <div className={`finding-slot ${findingVisible ? 'has-finding' : ''}`}>
              <div className="finding-skeleton" aria-hidden={findingVisible}>
                <FileCheck2 size={24} strokeWidth={1.2} />
                <span>Analyzing…</span>
              </div>
              {findingVisible && (
                <div className="quick-finding">
                  <strong className="finding-metric">{agent.metric}</strong>
                  <h3>{agent.finding}</h3>
                  <p>{agent.findingText}</p>
                  <button
                    className="evidence-button"
                    onClick={() => {
                      onInteract()
                      setEvidence(true)
                    }}
                  >
                    Evidence
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>
            <div className={`quick-review ${complete ? 'ready' : ''}`}>
              <div className="review-caption">
                <ShieldCheck size={13} />
                <span>{reviewed ? 'Reviewed · Follow-up required' : 'Human review required'}</span>
              </div>
              <button
                className={reviewed ? 'review-button reviewed' : 'review-button'}
                disabled={!complete || reviewed}
                onClick={() => {
                  onInteract()
                  onReview()
                }}
              >
                {reviewed ? (
                  <>
                    <CircleCheck size={13} />
                    Reviewed
                  </>
                ) : (
                  <>
                    Mark reviewed
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
              {reviewed && <span className="review-note">Saved locally.</span>}
            </div>
          </div>
        </section>
      </div>
      {evidence && (
        <EvidenceDialog
          id={agent.id}
          onClose={() => setEvidence(false)}
          onOpenSource={(sourceIndex) => {
            selectSource(sourceIndex)
            setEvidence(false)
            window.setTimeout(() => document.getElementById('source-preview')?.focus(), 30)
          }}
        />
      )}
    </div>
  )
}

function SourceRecord({ id, source, phase }: { id: AgentId; source: number; phase: number }) {
  if (id === 'credit')
    return (
      <>
        <p className="paper-eyebrow">MERIDIAN INDUSTRIAL HOLDINGS</p>
        <h3>
          {source === 0
            ? 'Borrower payment notice'
            : source === 1
              ? 'Loan servicing ledger'
              : 'Relevant loan terms'}
        </h3>
        <p className="paper-subtitle">Senior secured term loan · Q3 2026</p>
        <dl className="paper-details">
          <div>
            <dt>Loan reference</dt>
            <dd>{creditRecords.loanId}</dd>
          </div>
          <div>
            <dt>Payment date</dt>
            <dd>September 30, 2026</dd>
          </div>
        </dl>
        <h4>
          {source === 0
            ? 'Payment summary'
            : source === 1
              ? 'Scheduled vs. recorded'
              : '§ 4.2 · Contractual payment'}
        </h4>
        <table className="record-table">
          <thead>
            <tr>
              <th>{source === 1 ? 'Servicing record' : 'Payment component'}</th>
              <th>Amount (USD)</th>
            </tr>
          </thead>
          <tbody>
            {source === 1 ? (
              <>
                <tr>
                  <td>Scheduled payment</td>
                  <td>{money(creditRecords.ledger.expected)}</td>
                </tr>
                <tr className={phase >= 2 ? 'flagged-row' : ''}>
                  <td>Recorded payment</td>
                  <td>{money(creditRecords.ledger.recorded)}</td>
                </tr>
              </>
            ) : (
              <>
                <tr className={phase >= 2 ? 'flagged-row' : ''}>
                  <td>Interest {source === 0 ? 'reported' : 'due'}</td>
                  <td>
                    {money(
                      source === 0 ? creditRecords.notice.interest : creditRecords.terms.interest,
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Principal {source === 0 ? 'reported' : 'due'}</td>
                  <td>$50,000</td>
                </tr>
              </>
            )}
            <tr className="record-total">
              <td>{source === 1 ? 'Payment difference' : 'Total payment'}</td>
              <td>
                {money(
                  source === 0 ? creditRecords.notice.reported : source === 1 ? 25_000 : 1_250_000,
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="paper-note">
          {source === 0
            ? 'Bank receipt not provided.'
            : source === 1
              ? 'Settlement requires confirmation.'
              : 'Adjustments require approval.'}
        </p>
      </>
    )
  if (id === 'reporting') {
    const record = source === 1 ? reportingRecords.secondary : reportingRecords.primary
    return (
      <>
        <p className="paper-eyebrow">NORTHSTAR INFRASTRUCTURE FUND II</p>
        <h3>{source === 2 ? 'Reporting comparison' : record.label}</h3>
        <p className="paper-subtitle">Quarterly investor reporting · Q3 2026</p>
        <dl className="paper-details">
          <div>
            <dt>Investment ID</dt>
            <dd>{reportingRecords.investmentId}</dd>
          </div>
          <div>
            <dt>As of date</dt>
            <dd>September 30, 2026</dd>
          </div>
          <div>
            <dt>Currency / basis</dt>
            <dd>USD / Fair value</dd>
          </div>
        </dl>
        <h4>{source === 2 ? 'Source value comparison' : 'Investment valuation'}</h4>
        {source === 2 ? (
          <table className="record-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Fair value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Portfolio report</td>
                <td>$48,200,000</td>
              </tr>
              <tr>
                <td>Reporting extract</td>
                <td>$47,900,000</td>
              </tr>
              <tr className="record-total">
                <td>Difference</td>
                <td>$300,000</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="paper-valuation">
            <span>REPORTED FAIR VALUE</span>
            <strong>
              ${(record.value / 1e6).toFixed(1)}
              <span>M</span>
            </strong>
            <p>Northstar Infrastructure Fund II</p>
          </div>
        )}
        <p className="paper-note">Verify against the approved valuation record.</p>
      </>
    )
  }
  const { restriction, portfolio } = complianceRecords
  return (
    <>
      <p className="paper-eyebrow">HYPOTHETICAL INVESTMENT GUIDELINES</p>
      <h3>
        {source === 0
          ? 'Investment restriction'
          : source === 1
            ? 'Portfolio exposure'
            : 'Compliance review summary'}
      </h3>
      <p className="paper-subtitle">Single-sector concentration · Illustrative example</p>
      <dl className="paper-details">
        <div>
          <dt>Sector</dt>
          <dd>{portfolio.sector}</dd>
        </div>
        <div>
          <dt>As of date</dt>
          <dd>September 30, 2026</dd>
        </div>
        <div>
          <dt>Exposure basis</dt>
          <dd>Portfolio NAV</dd>
        </div>
      </dl>
      {source === 0 ? (
        <div className="policy-excerpt">
          <span>§ 3.1 · CONCENTRATION LIMIT</span>
          <blockquote>
            Exposure to any single sector must not exceed <strong>{restriction.limit}%</strong> of
            total portfolio net asset value.
          </blockquote>
        </div>
      ) : (
        <>
          <h4>
            {source === 1 ? 'Synthetic sector exposure' : 'Hypothetical threshold comparison'}
          </h4>
          <table className="record-table">
            <thead>
              <tr>
                <th>Measure</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sector exposure</td>
                <td>{money(portfolio.value)}</td>
              </tr>
              <tr>
                <td>Total portfolio NAV</td>
                <td>{money(portfolio.total)}</td>
              </tr>
              <tr className="record-total">
                <td>Concentration</td>
                <td>17.2%</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      <div className="concentration-chart">
        <div>
          <span>
            Exposure <strong>17.2%</strong>
          </span>
          <span>
            Limit <strong>15%</strong>
          </span>
        </div>
        <div className="concentration-track">
          <span />
          <i />
        </div>
        <div className="concentration-scale">
          <span>0%</span>
          <span>20%</span>
        </div>
      </div>
      <p className="paper-note">Hypothetical restriction. Confirm scope and exemptions.</p>
    </>
  )
}

function EvidenceDialog({
  id,
  onClose,
  onOpenSource,
}: {
  id: AgentId
  onClose: () => void
  onOpenSource: (index: number) => void
}) {
  const credit = analyzeCredit()
  const reporting = analyzeReporting()
  const compliance = analyzeCompliance()
  const rows =
    id === 'credit'
      ? credit.evidence.map((item) => ({
          label: item.label,
          value: money(item.value),
          description: item.description,
          ref: item.location,
          source: item.document === 'terms' ? 2 : item.document === 'ledger' ? 1 : 0,
        }))
      : id === 'reporting'
        ? [reportingRecords.primary, reportingRecords.secondary].map((item, index) => ({
            label: item.label,
            value: money(item.value),
            description: 'Same investment, date, currency, and valuation basis.',
            ref: item.reference,
            source: index,
          }))
        : [
            {
              label: 'Hypothetical restriction',
              value: '15% concentration limit',
              description: complianceRecords.restriction.text,
              ref: complianceRecords.restriction.reference,
              source: 0,
            },
            {
              label: 'Synthetic portfolio exposure',
              value: '17.2% of portfolio NAV',
              description: '$86,000,000 sector value / $500,000,000 portfolio NAV',
              ref: complianceRecords.portfolio.reference,
              source: 1,
            },
          ]
  return (
    <Modal
      title="Follow the evidence."
      eyebrow="ILLUSTRATIVE WORKFLOW SIMULATION"
      onClose={onClose}
    >
      <div className="evidence-summary">
        <span>EXCEPTION REQUIRING HUMAN REVIEW</span>
        <strong>
          {id === 'credit'
            ? money(credit.difference)
            : id === 'reporting'
              ? money(reporting.difference)
              : `${compliance.excess} percentage points`}
        </strong>
        <p>
          {id === 'credit'
            ? credit.summary
            : id === 'reporting'
              ? 'The portfolio report is higher than the secondary extract. This comparison does not establish which source is correct.'
              : 'The synthetic exposure exceeds the hypothetical threshold. A qualified person must assess applicability and any exemptions.'}
        </p>
      </div>
      <div className="evidence-records">
        {rows.map((row) => (
          <div className="evidence-row" key={row.ref}>
            <div>
              <span className="eyebrow">{row.label}</span>
              <strong>{row.value}</strong>
              <p>{row.description}</p>
              <code>{row.ref}</code>
            </div>
            <button
              onClick={() => onOpenSource(row.source)}
              aria-label={`Open ${row.label} source record`}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        ))}
      </div>
      <div className="evidence-human">
        <ShieldCheck size={17} />
        <p>
          {id === 'credit'
            ? 'Confirm any approved interest adjustments and reconcile with bank receipt evidence before deciding on next steps.'
            : id === 'reporting'
              ? 'Confirm valuation versions, timing, and approved adjustments against the authorized valuation record.'
              : 'Confirm policy scope, exposure methodology, and exemptions. This simulation does not determine a compliance breach.'}
        </p>
      </div>
    </Modal>
  )
}
