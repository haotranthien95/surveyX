---
phase: 2
slug: survey-creation-and-distribution
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing from Phase 1) |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | SURV-01 | unit | `npx vitest run survey` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SURV-02 | unit | `npx vitest run excel` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | SURV-03,04,05 | unit | `npx vitest run survey` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | EMAL-01 | unit | `npx vitest run smtp` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | EMAL-05 | unit | `npx vitest run token` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | EMAL-06,07 | unit | `npx vitest run email` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/services/survey.service.test.ts` — stubs for survey CRUD + question storage
- [ ] `__tests__/services/excel.service.test.ts` — stubs for Excel parsing + validation
- [ ] `__tests__/services/token.service.test.ts` — stubs for token generation + validation
- [ ] `__tests__/services/email.service.test.ts` — stubs for SMTP transport + send
- [ ] `__tests__/services/smtp.service.test.ts` — stubs for SMTP config persistence

*Wave 0 created by first task of each plan.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Excel drag-and-drop upload | SURV-02 | Browser drag event | Upload .xlsx file, verify questions appear in preview |
| SMTP onboarding modal | EMAL-02 | Browser modal rendering | Clear SMTP settings, visit /admin, verify modal appears |
| Email delivery | EMAL-06 | External SMTP server | Configure real SMTP, send test email, check inbox |
| Email template rendering | EMAL-07 | Visual HTML email | Send invitation, open email client, verify layout |
| Survey status badges | SURV-06 | Visual rendering | Create surveys in different states, verify badge colors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
