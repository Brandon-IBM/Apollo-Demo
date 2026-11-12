import { describe, expect, it } from 'vitest'
import {
  analyzeCompliance,
  analyzeCredit,
  analyzeReporting,
  complianceRecords,
  reportingRecords,
} from './data'

describe('deterministic exception analysis', () => {
  it('traces the credit shortfall to the three synthetic records', () => {
    const report = analyzeCredit()
    expect(report.expected).toBe(1_250_000)
    expect(report.actual).toBe(1_225_000)
    expect(report.difference).toBe(25_000)
    expect(report.evidence.map((item) => [item.document, item.value])).toEqual([
      ['terms', 1_250_000],
      ['notice', 1_225_000],
      ['ledger', 1_225_000],
    ])
    expect(report.checks).toContain('Reconcile the reported amount with bank receipt evidence.')
  })

  it('identifies the reporting variance and handles matching records', () => {
    expect(analyzeReporting()).toMatchObject({ difference: 300_000, matches: false })
    const matching = {
      ...reportingRecords,
      secondary: { ...reportingRecords.secondary, value: 48_200_000 },
    }
    expect(analyzeReporting(matching)).toMatchObject({ difference: 0, matches: true })
  })

  it('flags exposure above the restriction and reports percentage points', () => {
    expect(analyzeCompliance()).toEqual({ exposure: 17.2, excess: 2.2, flagged: true })
  })

  it('does not flag exposure exactly at or below the threshold', () => {
    for (const value of [75_000_000, 70_000_000]) {
      const records = { ...complianceRecords, portfolio: { ...complianceRecords.portfolio, value } }
      expect(analyzeCompliance(records).flagged).toBe(false)
    }
  })
})
