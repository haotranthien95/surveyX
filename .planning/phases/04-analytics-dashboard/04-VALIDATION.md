---
phase: 4
slug: analytics-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 4 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DASH-01,11 | unit | `npx vitest run analytics` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DASH-12 | build | `npx tsc --noEmit` | N/A | ⬜ pending |
| 04-02-01 | 02 | 1 | DASH-07 | build | `npx tsc --noEmit` | N/A | ⬜ pending |
| 04-02-02 | 02 | 1 | DASH-09,10 | build | `npx tsc --noEmit` | N/A | ⬜ pending |

## Wave 0 Requirements

- [ ] `__tests__/services/analytics.service.test.ts` — stubs for analytics computation

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Charts render from real data | DASH-01-06 | Visual rendering | Create survey with responses, verify charts show real numbers |
| Anonymity threshold hides segments | DATA-04 | Visual | Create segment with <5 responses, verify "Insufficient data" |
| Background animation present | UIUX-02 | Visual | Verify scattered pixels canvas visible behind dashboard |

**Approval:** pending
