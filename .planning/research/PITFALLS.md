# Pitfalls Research

**Domain:** Employee culture survey platform (bilingual, CSV-backed, Chart.js dashboards, SMTP email distribution)
**Researched:** 2026-04-01
**Confidence:** MEDIUM-HIGH (core pitfalls verified via official docs and multiple sources; some from known community patterns)

---

## Critical Pitfalls

### Pitfall 1: Vercel Serverless Filesystem is Read-Only — CSV Writes Will Silently Fail or Break

**What goes wrong:**
Developers write CSV files using `fs.writeFile()` targeting the project directory (e.g., `./data/responses.csv`). This works perfectly in local development but throws `EROFS: read-only file system` on Vercel because the function runtime filesystem is read-only. The only writable path is `/tmp`, which is ephemeral — it does not persist between invocations. A survey submitted at 2pm and another at 3pm may hit different serverless instances with entirely different `/tmp` state, silently losing data.

**Why it happens:**
Local development uses the actual filesystem, masking the Vercel constraint entirely. The project requirement of "CSV files with Vercel storage sync" implies writing locally first then syncing, but there is no persistent local filesystem on Vercel.

**How to avoid:**
Use Vercel Blob storage (`@vercel/blob`) as the primary persistence layer from day one. The pattern is: read existing CSV blob → append new row → write entire blob back. Never assume local file paths work in production. Structure the data layer as an abstraction (`storage.ts`) so the read/write implementation can be swapped without touching business logic.

**Warning signs:**
- Survey submissions return 200 OK but no data appears in admin dashboard
- Works on `localhost` but not on the deployed preview
- `console.error` in Vercel function logs shows `EROFS` or `ENOENT`

**Phase to address:**
Foundation/storage phase (Phase 1). This must be solved before any feature that writes data. Do not defer the Vercel storage layer.

---

### Pitfall 2: Concurrent Survey Submissions Corrupt the CSV File

**What goes wrong:**
Two employees submit surveys simultaneously. Both API route handlers read the same CSV blob, both append their row in memory, and both write back — the second write overwrites the first. One response is silently lost. This is a classic read-modify-write race condition with no database transaction to protect it.

**Why it happens:**
Node.js is single-threaded but async I/O allows concurrent requests. Vercel runs multiple serverless instances. Without optimistic locking, two in-flight writes will collide. CSV is not append-safe the way a database `INSERT` is.

**How to avoid:**
Use Vercel Blob's ETag-based conditional writes (`ifMatch` option). The pattern: `get()` the blob (capture ETag) → append row → `put()` with `ifMatch: etag`. If a `BlobPreconditionFailedError` is thrown, retry with fresh ETag. Alternatively, use Vercel KV as a response queue that batch-flushes to CSV, trading real-time persistence for conflict-free writes. For MVP scale (dozens of concurrent users), the retry loop is sufficient.

**Warning signs:**
- Response count in CSV does not match email send count after a survey drive
- Intermittent missing submissions that cannot be reproduced
- `BlobPreconditionFailedError` appearing in function logs without retry handling

**Phase to address:**
Phase 1 (storage layer). Implement retry logic in the CSV write helper before building any survey submission endpoint.

---

### Pitfall 3: Zawgyi vs. Unicode — Burmese Text Will Appear Garbled for Half Your Users

**What goes wrong:**
Myanmar is unique globally in that a large portion of users still use Zawgyi encoding rather than Unicode, and both encodings occupy the same Unicode code point range. A survey displayed with Noto Sans Myanmar (Unicode font) will render as garbage to a Zawgyi-configured device, and vice versa. Questions stored as Unicode will appear as scrambled characters to employees using older Android phones or browsers with Zawgyi system fonts. This is not a font weight issue — it is a fundamental encoding mismatch.

**Why it happens:**
Developers assume Unicode is universal. In most countries it is. In Myanmar, Zawgyi was the dominant standard for years and remains on millions of devices, especially older Android handsets common in corporate environments like Wave Money field staff.

**How to avoid:**
Store all Burmese content as Unicode internally (the standard since ~2019). On the client, use Google's open-source `myanmar-tools` library (published by Facebook/Meta engineering) to detect whether the rendering environment is Zawgyi or Unicode, and either convert display text or surface a warning. At minimum, ship both Noto Sans Myanmar (Unicode) and Pyidaungsu or a Zawgyi-compatible font, and use CSS `@font-face` with the `unicode-range` descriptor to target Myanmar code points explicitly. Test on real Android devices with factory-default Myanmar locale settings, not just desktop Chrome.

**Warning signs:**
- Burmese text renders correctly on MacOS/Windows but is reported as broken by users on Android
- Survey questions appear as rows of dots or disconnected diacritics
- Characters display as separate glyphs instead of stacked/combined clusters

**Phase to address:**
Phase 1 (foundation) — declare encoding strategy and font stack. Phase 2 (survey form) — test on Android with real Myanmar locale before launch.

---

### Pitfall 4: Chart.js Instances Not Destroyed Cause "Canvas Already in Use" Errors and Memory Leaks

**What goes wrong:**
The dashboard renders 15-21 Chart.js charts. When React re-renders the dashboard (filter change, date range update, tab switch), new Chart instances are created on the same canvas elements before old ones are destroyed. The error `Canvas is already in use. Chart with ID 'X' must be destroyed before the canvas can be reused` appears. In severe cases, the browser tab accumulates hundreds of MB of memory over a session and eventually crashes.

**Why it happens:**
Chart.js maintains a global registry of chart instances keyed by canvas element. When a React component re-renders, the canvas DOM node may persist while a new `new Chart(canvas, config)` call is made — without calling `.destroy()` on the previous instance first. This is especially common with conditional rendering and `useEffect` dependency arrays that don't include a cleanup function.

**How to avoid:**
Always return a cleanup function from `useEffect` that calls `chartInstance.destroy()`. Use `react-chartjs-2` (the official React wrapper) rather than bare Chart.js — it handles this lifecycle correctly. Store chart instance in a `useRef`, not `useState`. For the dashboard with 20+ charts, implement lazy rendering (only instantiate charts in the visible viewport using IntersectionObserver) to reduce initial render cost.

**Warning signs:**
- Console error: `Canvas is already in use`
- Dashboard becomes progressively slower after navigating away and back multiple times
- Browser memory usage climbs monotonically during a session

**Phase to address:**
Dashboard phase (Phase 3 or 4). Establish the chart component pattern once, with proper cleanup baked in, before building all 20+ chart types.

---

### Pitfall 5: i18n Hydration Mismatch — Server Renders English, Client Flashes Burmese

**What goes wrong:**
Next.js SSR renders the page in one language (defaulting to English) while the client-side language detection resolves to Burmese after hydration. React throws a hydration mismatch error, or the UI visibly "flashes" from English to Burmese on load. This is disorienting and breaks accessibility, and in some configurations causes full re-renders that wipe form state.

**Why it happens:**
Language detection using browser APIs (`navigator.language`, cookies, headers) runs differently on server vs. client. If the i18n library detects language client-side only, SSR output will not match the hydrated output. This is a documented bug in `next-i18next` with dynamic routes.

**How to avoid:**
Use `next-intl` (current recommendation for Next.js App Router) and drive locale from the URL path (`/en/survey/[token]` vs `/my/survey/[token]`) rather than browser detection. URL-based locale is SSR-safe because the server and client both know the locale from the request. Never use `localStorage` or `navigator.language` as the source of truth for locale — only URL path or a server-set cookie read at request time. Pass `initialMessages` to the provider to ensure SSR and client agree on translation content.

**Warning signs:**
- Hydration error in browser console on first load
- Text briefly appears in English then switches to Burmese (or vice versa)
- `suppressHydrationWarning` has been added to silence errors without fixing root cause

**Phase to address:**
Phase 1 (foundation) — choose URL-based locale strategy before building any pages. Changing this later requires rewriting all route structures.

---

### Pitfall 6: Unique Survey Links Are Guessable or Replayable Without Server-Side Invalidation

**What goes wrong:**
Survey tokens are generated with weak randomness (e.g., `Math.random()`, sequential IDs, or email hash), making them predictable or brute-forceable. Alternatively, tokens are cryptographically strong but never marked as used — employees can share links, submit multiple times, or an email that was forwarded allows a non-employee to submit. Either way, results are contaminated and data integrity is compromised.

**Why it happens:**
The survey form feels low-stakes ("just an internal survey"), so developers use simple token generation and skip invalidation logic. The CSV storage model also makes "check if token was used" a non-trivial operation — it requires scanning the CSV, which developers may skip.

**How to avoid:**
Generate tokens with `crypto.randomUUID()` or `crypto.randomBytes(32).toString('hex')` — never `Math.random()`. Store generated tokens in a "issued" CSV (or Vercel Blob record) with status: `pending | submitted`. On survey submission, atomically mark the token as `submitted` before saving response data. On survey load, check token status and return 410 Gone (not 404) for already-used tokens. The status check must be server-side in an API route, not client-side.

**Warning signs:**
- Same employee name appears multiple times in response CSV
- Response count exceeds email send count
- Token format is an email address hash or timestamp-based value

**Phase to address:**
Phase 2 (email distribution + survey form). Token generation and invalidation must ship together in the same phase — never ship link generation without the used-check.

---

### Pitfall 7: SMTP Configuration Fails Silently in Production — Emails Are Never Sent

**What goes wrong:**
Admin configures SMTP settings via the onboarding modal. The settings are saved and the UI shows "Emails sent successfully," but emails never arrive. Gmail blocks the login because 2FA is enabled and an App Password was not used. Corporate SMTP requires STARTTLS on port 587 but the app defaulted to SSL on port 465. SPF/DKIM records are not configured, so emails land in spam and are never seen.

**Why it happens:**
SMTP is highly environment-specific. The settings that work in local testing (often with Mailtrap or a personal Gmail account) differ from production corporate SMTP. The admin is non-technical and cannot debug SMTP configuration. Error responses from SMTP servers are technical strings that are swallowed and never surfaced.

**How to avoid:**
Build a "Send Test Email" button into the SMTP configuration modal that fires a real email to the admin's address immediately after saving settings, surfacing raw SMTP error messages in the UI. Default to port 587 + STARTTLS, not 465. Explicitly document that Gmail requires App Passwords (not the account password) when 2FA is enabled. Log SMTP errors with full error codes to Vercel function logs. For Nodemailer, set both `connectionTimeout` and `socketTimeout` to 15 seconds (not the 5s default) to avoid false failures on slow corporate networks.

**Warning signs:**
- Admin reports "sent" but no emails received
- SMTP settings saved without a test send being triggered
- Error logs show `ECONNREFUSED` or `ETIMEDOUT` with no user-visible feedback
- Emails arrive in spam folder with SPF/DKIM failures in headers

**Phase to address:**
Phase 2 (email distribution). The test-send button must be part of the SMTP setup flow, not a later addition.

---

### Pitfall 8: Dashboard Renders All 20+ Charts on Mount — Page Load Exceeds 10 Seconds

**What goes wrong:**
The admin dashboard mounts all chart components at once. With 20+ Chart.js canvas instances being instantiated, data being computed, and animations running simultaneously, the browser's main thread is blocked for several seconds. On lower-spec machines (common in Myanmar corporate environments), the page may appear frozen or time out.

**Why it happens:**
Developers build charts one at a time, each performing well in isolation. The aggregate cost is only discovered when the full dashboard is assembled. Chart.js animations (which run on the main thread) serialize poorly across many simultaneous instances.

**How to avoid:**
Use `IntersectionObserver` to mount chart components only when they scroll into view (lazy instantiation). Disable Chart.js animations on initial page load (`animation: false` globally, re-enable on hover/update). Use `dynamic(() => import('./ChartComponent'), { ssr: false })` in Next.js to prevent server-side canvas errors and reduce initial bundle. Pre-compute all aggregates server-side in a single pass over the CSV (not per-chart in the browser). Cache computed results in React state so filters recalculate from the pre-computed aggregate, not from re-reading CSV.

**Warning signs:**
- Dashboard takes more than 3 seconds to become interactive
- CPU spikes to 100% on dashboard load in Chrome DevTools
- Browser freezes briefly when navigating to the dashboard tab

**Phase to address:**
Dashboard phase. Establish the lazy-load + pre-computation pattern before implementing individual chart types.

---

### Pitfall 9: CSV Schema Drift Breaks Existing Responses After Adding New Questions

**What goes wrong:**
A new version of the survey adds or reorders questions. Existing response CSV files have columns in the old order. The dashboard code uses column index or column name to map responses to dimensions. After the schema change, old responses map to the wrong dimensions, or the parser crashes on missing columns. Year-over-year comparison charts become meaningless.

**Why it happens:**
CSV does not have schema enforcement. When questions are added or reordered, the developer updates the CSV header but existing rows retain the old structure. The code reading the CSV assumes a fixed schema.

**How to avoid:**
Always write CSV with explicit column headers on row 1 and read by header name, never by column index. Treat the CSV header row as the schema contract. Version survey definitions (each survey gets a `schemaVersion` field stored alongside responses). When parsing responses for the dashboard, join on `questionId` not column position. Include `questionId` as a column in the response CSV, not just the question text. Test dashboard rendering with mixed old+new response data.

**Warning signs:**
- Column index used anywhere in CSV parsing code (`row[4]` instead of `row['q_credibility_1']`)
- No `questionId` column in response CSV schema
- Dashboard breaks after adding a new demographic field

**Phase to address:**
Phase 1 (data model design). Define the CSV schema with explicit IDs before writing any survey or response code. Changing this retroactively is a rewrite.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Write CSV to `/tmp` locally and sync manually | Avoids Vercel Blob setup time | Silent data loss on Vercel; impossible to debug | Never — use Blob from day one |
| Use column index for CSV parsing | Simpler parsing code | Schema changes break entire dataset | Never |
| Disable Chart.js animations globally | Faster load | Less polished UX for the client | Acceptable for MVP, re-enable selectively later |
| Hardcode English strings + add Burmese as a later pass | Faster initial build | Every string must be found and extracted retroactively; easy to miss | Never — i18n from day one is cheaper |
| Generate tokens with `Date.now()` or email hash | No dependency on `crypto` | Guessable; security hole | Never |
| Skip "token used" check on survey load | Simpler API route | Double submissions contaminate analytics | Never |
| Store SMTP password in plaintext in CSV config | Simpler implementation | Password exposed in Vercel Blob; admin credential leak | Never — use environment variable or encrypted field |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel Blob | Read blob URL directly in browser (CORS issues) | Use a Next.js API route as proxy for blob reads requiring auth |
| Nodemailer + Gmail | Use Google account password directly | Generate App Password in Google account settings; enable 2-step verification first |
| Nodemailer + corporate SMTP | Default to port 465 SSL | Default to port 587 STARTTLS; let admin override |
| `@vercel/blob` concurrent write | Assume write always succeeds | Wrap in retry loop catching `BlobPreconditionFailedError` |
| `xlsx` (SheetJS) parsing Myanmar text | Assume UTF-8 roundtrip is clean | Explicitly set `codepage: 65001` and validate Unicode code points after parsing |
| Chart.js in Next.js | Import at top-level in a Server Component | Always use `'use client'` directive + `dynamic()` import with `ssr: false` |
| `next-intl` locale routing | Use `detectLocale` from browser headers | Derive locale from URL path only; set in middleware |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-reading CSV blob on every API call | Dashboard takes 2-5s to load; Blob read costs mount up | Cache parsed CSV in memory per serverless instance; add stale-while-revalidate | At 500+ responses (CSV grows to >100KB) |
| Computing all chart aggregates in browser | Main thread freezes; 100% CPU spike on dashboard load | Pre-compute aggregates in API route; send summary data to browser | At 200+ responses across 46 questions |
| Mounting all 20+ Chart.js instances simultaneously | Dashboard non-interactive for 5-10 seconds | IntersectionObserver lazy mount; `animation: false` on load | Always — even at 10 responses |
| Re-rendering all charts on every filter change | Filter interactions are laggy | `useMemo` for filtered data; only re-render affected chart components | At 5+ charts with complex filters |
| Loading full question list with bilingual text for every survey page load | Slow initial form render; large payload | Pre-build question manifest at survey creation time; store in Blob | At 46+ bilingual questions |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Generating survey tokens with `Math.random()` | Tokens are guessable (only 2^52 bits of entropy); attacker can enumerate valid tokens | Use `crypto.randomBytes(32).toString('hex')` always |
| Not invalidating token after submission | Link forwarding allows non-employees or repeat submissions; data contamination | Mark token `submitted` server-side before writing response; reject subsequent attempts with 410 |
| Storing SMTP password in Vercel Blob alongside survey config | Admin SMTP credentials exposed in storage breach | Store SMTP password in Vercel environment variable; never write to file/blob |
| Admin password hardcoded in source code | Password visible in git history | Store in environment variable; never commit credentials |
| No rate limiting on survey submission endpoint | Automated bots can flood responses | Add simple IP-based rate limiting (e.g., 1 submission per IP per hour) using Vercel Edge middleware |
| Token visible in URL query param (e.g., `?token=abc`) | Token logged in Vercel access logs, CDN logs, browser history | Use path-based tokens (`/survey/[token]`) not query params |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No progress save on multi-section survey | Employee loses all answers if browser closes or session times out mid-survey | Auto-save to `localStorage` after each question; restore on page reload with same token |
| Confirmation dialog is the only feedback after submission | Employee unsure if submission was recorded; anxiety about data loss | Show a dedicated thank-you page (new route) with submission timestamp, not just a dialog |
| Survey form in Burmese with English-only error messages | Burmese-speaking employees cannot understand validation errors | All validation messages must be i18n'd — this is easy to miss on error paths |
| Floating TOC disappears on mobile viewport | Mobile users lose navigation context in long surveys | Test TOC visibility breakpoints explicitly; consider a bottom-fixed TOC for mobile |
| "Strongly Disagree" on the left feels negative-first to some cultures | Anchoring bias; employees may skew positive responses | Keep Strongly Disagree on the left (standard academic convention) but label clearly in both languages |
| Charts without loading states | Dashboard appears broken while CSV is being fetched | Add skeleton loaders for each chart container; show loading state independently per chart |

---

## "Looks Done But Isn't" Checklist

- [ ] **CSV storage:** Verify that a response submitted on Vercel (not localhost) actually persists after the function completes — check the Blob storage directly.
- [ ] **Concurrent submissions:** Submit two survey responses simultaneously (use two browser tabs within 1 second of each other) and verify both appear in the CSV.
- [ ] **Token invalidation:** Copy a used survey link and paste it in a fresh browser — verify it returns an appropriate error, not the survey form.
- [ ] **Burmese rendering:** Test the deployed app on a real Android device set to Myanmar locale, not just desktop Chrome with a Myanmar font installed.
- [ ] **Email delivery:** Send a real test email from the admin SMTP configuration modal before declaring email feature complete — check spam folder too.
- [ ] **SMTP errors:** Intentionally provide wrong SMTP credentials and verify the error message shown to the admin is human-readable, not a raw Node.js stack trace.
- [ ] **Chart cleanup:** Navigate to dashboard, navigate away, navigate back — repeat 10 times. Check Chrome DevTools Memory tab for monotonic heap growth.
- [ ] **i18n completeness:** Switch locale and verify every UI string — especially error messages, validation hints, and toast notifications — is translated. Untranslated strings are easy to miss on edge paths.
- [ ] **CSV schema:** Add a new demographic field, submit a response, and verify the existing responses still parse and display correctly in the dashboard.
- [ ] **Excel upload:** Upload an Excel file where Burmese text is in the second column — verify Unicode round-trip is clean and characters are not garbled after parsing.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSV data loss from ephemeral `/tmp` | HIGH | Restore from email logs (sent links match expected respondents); manual re-entry; no automated recovery if Blob was never used |
| Concurrent write collision data loss | MEDIUM | Implement retry with ETag; rerun survey for affected respondents; de-duplicate by employee email + timestamp |
| Zawgyi encoding corruption in stored data | HIGH | Detect encoding with `myanmar-tools` and run a one-time conversion pass on all stored Burmese text; test against original source PDF |
| Token replay contamination | MEDIUM | Identify duplicate submissions by employee email + submission timestamp; remove later duplicates; add invalidation going forward |
| Chart memory leak in production | LOW | Force page refresh on dashboard mount; proper cleanup is a code fix (hours, not days) |
| i18n hydration mismatch in production | MEDIUM | Switch to URL-based locale routing; requires route restructure but is a one-time migration |
| SMTP credential leak | HIGH | Rotate SMTP password immediately; audit Blob storage for other secrets; move to environment variable |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vercel read-only filesystem | Phase 1 — Storage layer | Deploy to Vercel preview and submit a test response; confirm it persists in Blob |
| CSV concurrent write race condition | Phase 1 — Storage layer | Concurrent submission test (two requests within 1s) both appear in CSV |
| Zawgyi vs. Unicode encoding | Phase 1 — Foundation + Phase 2 survey form | Test on Android with Myanmar locale; Burmese characters display as stacked clusters |
| Chart.js memory leaks | Phase 3/4 — Dashboard (first chart component) | Navigate away/back 10x; DevTools shows flat memory profile |
| i18n hydration mismatch | Phase 1 — Foundation routing | No hydration errors in browser console on first load in either locale |
| Weak/replayable survey tokens | Phase 2 — Email distribution + survey form | Token entropy check; used link returns 410; no duplicates after concurrent test |
| SMTP silent failure | Phase 2 — Email distribution | Test-send button surfaces real SMTP errors in the UI |
| Dashboard render performance | Phase 3/4 — Dashboard | Dashboard interactive within 3 seconds on mid-range Android device |
| CSV schema drift | Phase 1 — Data model | Mixed old+new response CSV parses without error in dashboard |
| Missing Burmese validation messages | Phase 2 — Survey form | Submit invalid form in Burmese locale; all error text is in Burmese |

---

## Sources

- [Vercel — Read-only filesystem / writable /tmp](https://github.com/vercel/community/discussions/314)
- [Vercel Blob — ETag conditional writes / BlobPreconditionFailedError](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Vercel Functions — File descriptor limits](https://vercel.com/docs/functions/limitations)
- [Node.js — writeFile corruption with concurrent high-frequency writes](https://github.com/nodejs/help/issues/2346)
- [Node.js — fs.writeFile partial write corruption](https://github.com/nodejs/node/issues/1058)
- [Myanmar encoding — Zawgyi vs. Unicode explained](https://www.globalapptesting.com/blog/zawgyi-vs-unicode)
- [Facebook/Meta — Path from Zawgyi to Unicode (myanmar-tools)](https://engineering.fb.com/2019/09/26/android/unicode-font-converter/)
- [Unicode.org — Myanmar script FAQ](https://www.unicode.org/faq/myanmar)
- [Noto Sans Myanmar rendering bug on OS X/iOS](https://github.com/google/fonts/issues/412)
- [Chart.js — "Canvas is already in use" React issue](https://github.com/reactchartjs/react-chartjs-2/issues/1037)
- [Chart.js — Memory leak with maintainAspectRatio:false](https://github.com/chartjs/Chart.js/issues/11299)
- [Chart.js — Official performance guide](https://www.chartjs.org/docs/latest/general/performance.html)
- [next-i18next — Hydration error in dynamic routes](https://github.com/i18next/next-i18next/issues/2258)
- [Next.js — React hydration error documentation](https://nextjs.org/docs/messages/react-hydration-error)
- [Nodemailer — SMTP transport documentation](https://nodemailer.com/smtp)
- [Nodemailer — Error reference](https://nodemailer.com/errors)
- [OWASP — CSRF prevention cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Likert scale — Common analysis mistakes](https://www.intellisurvey.com/blog/5-likert-scale-mistakes)

---
*Pitfalls research for: bilingual employee culture survey platform (Next.js + CSV + Chart.js + SMTP)*
*Researched: 2026-04-01*
