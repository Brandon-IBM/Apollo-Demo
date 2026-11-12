import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('slides advance every 12 seconds and loop through all three agents', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.install()
  await page.goto('/')
  const slide = page.getByRole('group', { name: /^\d of 3:/ })
  await expect(slide).toHaveAttribute('aria-label', /1 of 3: Private Credit/)
  await page.clock.runFor(11_800)
  await expect(slide).toHaveAttribute('aria-label', /1 of 3:/)
  await page.clock.runFor(300)
  await expect(slide).toHaveAttribute('aria-label', /2 of 3: Investor Reporting/)
  await page.clock.runFor(12_000)
  await expect(slide).toHaveAttribute('aria-label', /3 of 3: Investment Compliance/)
  await page.clock.runFor(12_000)
  await expect(slide).toHaveAttribute('aria-label', /1 of 3:/)
})

test('pause freezes playback and resume preserves remaining time', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.install()
  await page.goto('/')
  await page.clock.runFor(5_000)
  await page.getByRole('button', { name: 'Pause slideshow' }).click()
  const pausedProgress = await page
    .locator('#agent-tab-0 .tab-progress > span')
    .getAttribute('style')
  await page.clock.runFor(30_000)
  await expect(page.locator('#agent-tab-0 .tab-progress > span')).toHaveAttribute(
    'style',
    pausedProgress!,
  )
  await expect(page.getByRole('tab', { name: /Credit servicing/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('button', { name: 'Play slideshow' }).click()
  await page.clock.runFor(7_100)
  await expect(page.getByRole('tab', { name: /Reporting QA/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('credit preview has real evidence, source navigation, and local review', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Replay demo' }).click()
  await page.clock.runFor(5_000)
  await expect(page.getByText('Payment shortfall', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mark reviewed', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Evidence' }).click()
  await expect(page.getByRole('button', { name: 'Play slideshow' })).toBeVisible()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('$1,250,000')
  await expect(dialog).toContainText('$1,225,000')
  await expect(dialog).toContainText('AGR-2026-0415 · § 4.2')
  await expect(dialog).toContainText('LDG-2026-0930 · Row 12')
  await dialog.getByRole('button', { name: 'Open Contractual payment source record' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('tab', { name: 'Loan terms' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByRole('tabpanel', { name: 'Loan terms' })).toContainText('$1,250,000')
  await page.getByRole('button', { name: 'Mark reviewed', exact: true }).click()
  await expect(page.getByText('Reviewed · Follow-up required', { exact: true })).toBeVisible()
  await expect(page.getByText('Saved locally.')).toBeVisible()
  await page.getByRole('button', { name: 'Replay demo' }).click()
  await expect(page.getByText('Reviewed · Follow-up required', { exact: true })).not.toBeVisible()
})

test('reporting and compliance quick demos show the correct amounts and evidence', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('tab', { name: /Reporting QA/ }).click()
  await page.getByRole('button', { name: 'Replay demo' }).click()
  await page.clock.runFor(5_000)
  await expect(page.locator('.finding-metric')).toHaveText('$300,000')
  await page.getByRole('button', { name: 'Evidence' }).click()
  await expect(page.getByRole('dialog')).toContainText('$48,200,000')
  await expect(page.getByRole('dialog')).toContainText('$47,900,000')
  await page.keyboard.press('Escape')
  await page.getByRole('tab', { name: /Compliance/ }).click()
  await page.getByRole('button', { name: 'Replay demo' }).click()
  await page.clock.runFor(5_000)
  await expect(page.locator('.finding-metric')).toHaveText('2.2 pp')
  await page.getByRole('button', { name: 'Evidence' }).click()
  await expect(page.getByRole('dialog')).toContainText('15% concentration limit')
  await expect(page.getByRole('dialog')).toContainText('17.2% of portfolio NAV')
  await expect(page.getByRole('dialog')).toContainText('POL-SYN-015 · § 3.1')
  await expect(page.getByRole('dialog')).toContainText('does not determine a compliance breach')
})

test('manual selection, keyboard navigation, replay, and discovery controls work', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('tab', { name: /Credit servicing/ }).focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tab', { name: /Compliance/ })).toBeFocused()
  await expect(page.getByRole('tab', { name: /Compliance/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('button', { name: 'Next agent' }).click()
  await expect(page.getByRole('tab', { name: /Credit servicing/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('button', { name: 'Previous agent' }).click()
  await expect(page.getByRole('tab', { name: /Compliance/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('button', { name: 'Replay demo' }).click()
  await expect(page.getByRole('button', { name: 'Pause slideshow' })).toBeVisible()
  await page.getByRole('button', { name: 'About', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('no live AI or client systems')
  await expect(page.getByRole('dialog')).toContainText('security controls')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Let’s discuss' }).click()
  await expect(page.getByRole('dialog')).toContainText('What’s worth solving?')
  await expect(page.getByRole('dialog').locator('.discovery-questions > li')).toHaveCount(3)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('reduced motion starts paused and keeps manual controls available', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Play slideshow' })).toBeVisible()
  await page.clock.runFor(24_000)
  await expect(page.getByRole('tab', { name: /Credit servicing/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('desktop and mobile layouts fit, and every slide passes automated WCAG checks', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/')
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const index of [0, 1, 2]) {
      await page.locator(`#agent-tab-${index}`).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }
  }
  for (const index of [0, 1, 2]) {
    await page.locator(`#agent-tab-${index}`).click()
    await page.getByRole('button', { name: 'Replay demo' }).click()
    await page.clock.runFor(5_000)
    await page.getByRole('button', { name: 'Pause slideshow' }).click()
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([])
    await page.getByRole('button', { name: 'Evidence' }).click()
    const dialogResult = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      dialogResult.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([])
    await page.keyboard.press('Escape')
  }
})
