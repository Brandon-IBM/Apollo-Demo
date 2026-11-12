export type Section = 'overview' | 'credit' | 'reporting' | 'compliance' | 'discussion'
export type WorkflowStatus = 'idle' | 'running' | 'complete'
export type ReviewStatus = 'pending' | 'approved' | 'follow-up'
export type SourceId = 'notice' | 'ledger' | 'terms'

export interface SourceDocument {
  id: SourceId
  title: string
  filename: string
  format: 'PDF' | 'XLSX'
  reference: string
  description: string
}

export const sections: { id: Section; label: string; duration: string }[] = [
  { id: 'overview', label: 'Overview', duration: '10 sec' },
  { id: 'credit', label: 'Credit Servicing', duration: '60 sec' },
  { id: 'reporting', label: 'Reporting QA', duration: '20 sec' },
  { id: 'compliance', label: 'Compliance', duration: '20 sec' },
  { id: 'discussion', label: 'Discussion', duration: '10 sec' },
]

export const documents: SourceDocument[] = [
  {
    id: 'notice',
    title: 'Borrower payment notice',
    filename: 'meridian_payment_notice.pdf',
    format: 'PDF',
    reference: 'NTC-2026-0930',
    description: 'Borrower-submitted payment details',
  },
  {
    id: 'ledger',
    title: 'Loan servicing ledger',
    filename: 'servicing_ledger_sep2026.xlsx',
    format: 'XLSX',
    reference: 'LDG-2026-0930',
    description: 'Scheduled and recorded transactions',
  },
  {
    id: 'terms',
    title: 'Relevant loan terms',
    filename: 'meridian_loan_terms.pdf',
    format: 'PDF',
    reference: 'AGR-2026-0415',
    description: 'Contractual payment requirements',
  },
]

export const creditRecords = {
  loanId: 'SYN-MIH-042',
  borrower: 'Meridian Industrial Holdings',
  facility: 'Senior secured term loan',
  currency: 'USD',
  paymentDate: '2026-09-30',
  notice: {
    reference: 'NTC-2026-0930',
    interest: 1_175_000,
    principal: 50_000,
    reported: 1_225_000,
    paymentDate: '2026-09-30',
  },
  ledger: {
    reference: 'LDG-2026-0930',
    expected: 1_250_000,
    recorded: 1_225_000,
    dueDate: '2026-09-30',
  },
  terms: {
    reference: 'AGR-2026-0415',
    interest: 1_200_000,
    principal: 50_000,
    dueDate: '2026-09-30',
    section: '§ 4.2 · Payment schedule',
  },
}

export interface EvidenceReference {
  document: SourceId
  label: string
  location: string
  value: number
  description: string
}

export interface ExceptionReport {
  id: string
  title: string
  expected: number
  actual: number
  difference: number
  summary: string
  evidence: EvidenceReference[]
  checks: string[]
}

// Pure, deterministic comparisons. A production adapter can return the same
// report shape after approved retrieval and analysis in a separate service.
export function analyzeCredit(records = creditRecords): ExceptionReport {
  const expected = records.terms.interest + records.terms.principal
  return {
    id: 'EXC-001',
    title: 'Payment amount discrepancy',
    expected,
    actual: records.notice.reported,
    difference: expected - records.notice.reported,
    summary:
      'The borrower notice reports $25,000 less than the contractual payment. The difference is in the interest component; principal and payment dates match.',
    evidence: [
      {
        document: 'terms',
        label: 'Contractual payment',
        location: `${records.terms.reference} · § 4.2`,
        value: expected,
        description: '$1,200,000 interest + $50,000 principal',
      },
      {
        document: 'notice',
        label: 'Reported payment',
        location: `${records.notice.reference} · Payment summary`,
        value: records.notice.reported,
        description: '$1,175,000 interest + $50,000 principal',
      },
      {
        document: 'ledger',
        label: 'Servicing record',
        location: `${records.ledger.reference} · Row 12`,
        value: records.ledger.recorded,
        description: 'Scheduled: $1,250,000 · Recorded: $1,225,000',
      },
    ],
    checks: [
      'Confirm the interest calculation and any approved adjustments.',
      'Reconcile the reported amount with bank receipt evidence.',
      'Confirm whether a corrected notice or remaining payment is required.',
    ],
  }
}

export const reportingRecords = {
  investment: 'Northstar Infrastructure Fund II',
  investmentId: 'SYN-NIF-018',
  valuationDate: 'September 30, 2026',
  currency: 'USD',
  primary: {
    label: 'Portfolio reporting record',
    reference: 'RPT-2026-Q3 · Row 18',
    value: 48_200_000,
    asOf: '2026-09-30',
    basis: 'Fair value',
  },
  secondary: {
    label: 'Secondary reporting extract',
    reference: 'EXT-2026-Q3 · Row 18',
    value: 47_900_000,
    asOf: '2026-09-30',
    basis: 'Fair value',
  },
}

export function analyzeReporting(records = reportingRecords) {
  return {
    difference: records.primary.value - records.secondary.value,
    matches: records.primary.value === records.secondary.value,
    percentage: ((records.primary.value - records.secondary.value) / records.primary.value) * 100,
  }
}

export const complianceRecords = {
  restriction: {
    reference: 'POL-SYN-015 · § 3.1',
    title: 'Single-sector concentration',
    limit: 15,
    text: 'Exposure to any single sector must not exceed 15% of total portfolio net asset value.',
    basis: 'Portfolio net asset value',
  },
  portfolio: {
    reference: 'EXP-2026-Q3 · Row 7',
    sector: 'Industrial services',
    exposure: 17.2,
    value: 86_000_000,
    total: 500_000_000,
    asOf: 'September 30, 2026',
  },
}

export function analyzeCompliance(records = complianceRecords) {
  const exposure = (records.portfolio.value / records.portfolio.total) * 100
  return {
    exposure,
    excess: Number((exposure - records.restriction.limit).toFixed(1)),
    flagged: exposure > records.restriction.limit,
  }
}

export const creditSteps = [
  {
    title: 'Extract payment details',
    detail: 'Read the borrower notice and identify the loan, date, and amounts.',
  },
  {
    title: 'Retrieve matching records',
    detail: 'Match SYN-MIH-042 to the servicing ledger and contractual terms.',
  },
  {
    title: 'Compare amounts and dates',
    detail: 'Compare interest, principal, payment dates, and posted records.',
  },
  {
    title: 'Identify discrepancies',
    detail: 'Flag the interest variance and missing bank receipt evidence.',
  },
  {
    title: 'Prepare exception report',
    detail: 'Attach source references and suggested checks for human review.',
  },
]

export const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export function exportReport(report: ExceptionReport, review: ReviewStatus, note: string) {
  const lines = [
    'EXCEPTION REPORT — HUMAN REVIEW REQUIRED',
    'Illustrative workflow simulation. All records and figures are synthetic.',
    '',
    `Report: ${report.id}`,
    `Loan: ${creditRecords.loanId}`,
    `Borrower: ${creditRecords.borrower}`,
    `Expected payment: ${money(report.expected)}`,
    `Reported payment: ${money(report.actual)}`,
    `Difference: ${money(report.difference)}`,
    '',
    report.summary,
    '',
    'SUPPORTING EVIDENCE',
    ...report.evidence.map(
      (item) => `${item.location}: ${money(item.value)} — ${item.description}`,
    ),
    '',
    'FOLLOW-UP CHECKS',
    ...report.checks.map((check, index) => `${index + 1}. ${check}`),
    '',
    `Review status: ${review === 'approved' ? 'Reviewed — follow-up approved' : review === 'follow-up' ? 'Follow-up requested' : 'Awaiting human review'}`,
    `Analyst note: ${note || 'No note recorded.'}`,
    '',
    'Review is a local demonstration action. No payment, financial transaction, or external request has been executed.',
  ]
  const url = URL.createObjectURL(
    new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'synthetic-exception-report-EXC-001.txt'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
