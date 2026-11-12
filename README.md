# Apollo Opportunity Lab

A single-page, Cursor-inspired landing page featuring three animated agent previews. The interface keeps one headline, a demo window, and playback controls. The design uses Apollo-inspired slate blue (`#395878`), warm white (`#fef8f3`), and deep navy, with an independent Opportunity Lab identity.

The large demo window automatically rotates through credit servicing, reporting QA, and compliance **every 12 seconds**. Each slide animates a deterministic workflow: read source records, compare information, identify a discrepancy, and prepare a finding for human review. There are no live models or client-system connections.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

Fonts are bundled locally. The deployed site requires no external data requests, environment variables, API keys, backend, or database.

## Presentation controls

- Slides advance every **12 seconds** and loop after the third agent. A complete loop takes 36 seconds.
- Use the three tabs, or the previous/next arrows to select a slide. Selecting a slide resets its 12-second interval.
- **Pause / Play** preserves the elapsed time. **Replay** restarts the current workflow and clears its local review acknowledgement.
- Opening source records, evidence, discussion, or the about dialog pauses playback. Select Play to resume.
- Source documents and agent tabs support arrow-key navigation. Evidence dialogs support Escape dismissal and trap keyboard focus.
- The slideshow pauses while the browser tab is hidden. With reduced-motion preferences, it starts paused; Play or Replay remains available.
- **Let’s discuss** opens the three discovery questions without navigating away from the landing page.

## Illustrative workflows

1. **Private Credit Servicing Agent:** The synthetic Meridian Industrial loan terms require $1,250,000; the borrower notice and servicing ledger record $1,225,000. The $25,000 difference is in interest. Click the finding’s evidence link to inspect source references and open the corresponding record. Bank receipt evidence and any approved adjustments still require investigation.
2. **Investor Reporting QA Agent:** Synthetic fair values of $48.2M and $47.9M produce a $300,000 exception. A reviewer must establish which source is correct.
3. **Investment Compliance Agent:** A hypothetical 15% concentration threshold is compared with $86M / $500M portfolio NAV = 17.2%. The potential exception is 2.2 **percentage points**. This comparison does not establish a compliance breach or authorize an investment decision.

**Mark reviewed** records a local acknowledgement and keeps follow-up required. No transactions, external requests, report amendments, or investment decisions are executed. Review state clears when the page reloads.

## Positioning

This is an independent technical exploration prepared by Sid and Brandon, IBM engineers. Concepts are informed by public research, not validated Apollo requirements. They are not deployed agents or approved offerings. No official Apollo or IBM affiliation, endorsement, or partnership is implied. All workflow entities, records, dates, amounts, and restrictions are fictional.

A real implementation would require business validation, approved data access, security controls, integration design, and agreed evaluation criteria. The footer’s About dialog describes these boundaries without adding more landing-page text.

## Architecture

- `src/App.tsx`: compact header, landing-page hero, carousel controls, and about/discussion dialogs.
- `src/hooks.ts`: 12-second carousel clock, workflow phases, pause/resume, background-tab behavior, and reduced-motion defaults.
- `src/components/AgentPreview.tsx`: reusable source browser, animated activity feed, exception finding, human review, and evidence dialog for all three agents.
- `src/components/Shared.tsx`: independent Lab mark and accessible modal.
- `src/data.ts`: typed synthetic records, deterministic comparison functions, and evidence references. A future approved service could replace these comparisons while retaining the source/evidence structures.
- `src/styles.css`: responsive landing-page and demo-window styling.

The UI is live HTML and React rather than a screenshot or video. Its source selectors, evidence links, review controls, playback controls, and dialogs work locally. The file extensions displayed in the source preview illustrate potential source formats; the documents are structured sample records rendered in HTML.

## Verification

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

The browser tests cover exact 12-second rotation and looping, pause/resume timing, replay, source evidence, review acknowledgement, keyboard controls, reduced-motion defaults, viewport widths from 360 to 1440 pixels, and automated WCAG AA checks. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium-compatible browser. Automated checks supplement manual testing; they are not a full accessibility certification.

## GitHub Pages

Vite uses the relative base `./`, including for fonts, so the build supports repository subpaths. The included `.github/workflows/deploy.yml` builds and deploys `dist/` on pushes to `main` or manual runs.

1. Push this project to a GitHub repository. Adjust the workflow branch filter if its default branch is not `main`.
2. Under **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. Run **Deploy to GitHub Pages** or push to `main`. The deployment job reports the published URL.

No site is published by local development or builds. The `dist/` output also works with any static web server.

## Fonts and icons

DM Sans is bundled under the SIL Open Font License, with its original license in `public/fonts/licenses/`. Icons are from Lucide (ISC license). The Opportunity Lab mark is independent of Apollo, IBM, and Cursor.
