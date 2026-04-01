# Phase 3: Employee Survey Form - Research

**Researched:** 2026-04-01
**Domain:** Next.js 16 App Router, next-intl v4, base-ui RadioGroup/Select, React form state, IntersectionObserver, CSV persistence
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Survey Form Layout & Navigation**
- Single scrolling page with section cards (not multi-page wizard) — mirrors Google Forms, allows full review before submit
- Desktop: floating TOC on left sidebar, 240px wide, sticky positioned
- Mobile: sticky top bar (56px) with horizontal scrollable section names + linear progress bar
- Section completion tracking via IntersectionObserver on section headers — updates TOC highlight in real-time, shows checkmark when all questions in section answered

**Likert Scale Interaction & Input Types**
- Desktop: horizontal radio row, 5 options evenly spaced, 44px minimum touch targets per option
- Mobile: vertical stack, full-width tappable rows (48px height), selected row gets blue-50 bg + blue-200 border
- Open-ended questions: full-width textarea, 4 rows, character count shown below
- Demographics: radio group for Role Type, Select dropdown for Service Year and Organization

**Submission Flow & Token Handling**
- Validation on submit only; after first failed attempt, validate per-field on change (avoids policing feel)
- Confirmation dialog: CheckCircle icon (blue) + "Ready to Submit?" heading + anonymity reminder text + Submit Survey / Cancel buttons
- Thank you screen: full-page with green check icon, "Your response has been recorded anonymously" message, organization branding
- Invalid/used token: 410 Gone with friendly error page "This survey link has already been used" + contact admin suggestion
- Expired/missing token: 404 with "Survey link not found" message

### Claude's Discretion
- Exact section card spacing and padding values
- Welcome screen design (before demographics)
- Error message wording for validation
- Scroll behavior (smooth vs instant)
- Animation on section transitions
- Loading skeleton while token validates

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FORM-01 | Employee accesses survey via unique URL with token; email pre-filled from token lookup | validateToken() exists in token.service.ts; route is /[locale]/survey/[token] — public, no auth middleware needed |
| FORM-02 | Survey form displays in multi-section layout with floating TOC on left side | Single-page scroll with 7 section cards; TOC 240px sticky sidebar; UX spec section 7.3 covers full spec |
| FORM-03 | Floating TOC tracks progress showing completed/remaining sections | IntersectionObserver pattern on section header refs; completion = all required questions in section answered |
| FORM-04 | Survey renders in selected language (English or Burmese) with language switcher | next-intl useLocale + question.en / question.my field selection; existing LanguageSwitcher component |
| FORM-05 | Likert scale questions display 5 options (Strongly Disagree to Strongly Agree) in selected language | Custom LikertInput component using base-ui RadioGroup; desktop horizontal / mobile vertical layout |
| FORM-06 | Open-ended questions provide text area input | Existing src/components/ui/textarea.tsx; optional, no validation required |
| FORM-07 | Demographic section collects Organization, Service Year, and Role Type with predefined options in both languages | base-ui Select for Org + ServiceYear; RadioGroup for RoleType; options from question.options bilingual array |
| FORM-08 | Form validation with inline error messages, guidelines, and tooltips | Submit-only first pass; then onChange for touched fields; auto-scroll to first error |
| FORM-09 | Confirmation dialog shown before final submission | Existing src/components/ui/dialog.tsx (base-ui); dismissible via ESC and backdrop — unlike SMTP modal |
| FORM-10 | Token marked as used server-side upon submission (prevents resubmission) | markTokenUsed() does NOT exist yet — must add to token.service.ts; uses writeRows (full CSV overwrite) |
| FORM-11 | Responses persisted to CSV file partitioned by survey ID | appendRow to responses-{surveyId}.csv; Response type in types.ts; ETag retry already in appendRow |
| FORM-12 | Basic information fields (name, department) available as optional inputs | Hidden/readonly email field from token lookup; optional name + department text inputs |
</phase_requirements>

---

## Summary

Phase 3 builds the employee-facing survey form. Employees arrive via a unique token URL generated in Phase 2. The page is a single scrollable form with 7 section cards (5 GPTW dimensions + open-ended + demographics), a floating desktop TOC, and a mobile sticky progress bar. All UI text is bilingual (English/Myanmar) via next-intl, and question text alternates between `question.en` and `question.my` based on the active locale.

The critical data flow is: token in URL → `validateToken()` server-side → load survey + questions → render form → collect answers in React state → confirmation dialog → POST to new submission API → `appendRow` response + `markTokenUsed` → thank-you screen. The `markTokenUsed` function does not yet exist in `token.service.ts` and must be written as part of this phase.

The primary risk areas are: (1) the IntersectionObserver-based section tracking requiring careful `useRef` and cleanup patterns; (2) the token → survey lookup needing a new public API route that bypasses the admin auth guard in `proxy.ts`; (3) Myanmar Unicode typography requiring explicit `line-height: 1.75` overrides on question text.

**Primary recommendation:** Build as a Server Component page that validates the token server-side and passes initial data as props; all form interaction is a single "use client" child component. Keep the submission API route at `/api/surveys/[id]/submit` (public, no session auth, token-authenticated).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (App Router) | 16.2.2 (installed) | Route `/[locale]/survey/[token]`, Server Components, API route handler | Project baseline; page.tsx + route.ts patterns established in phases 1-2 |
| next-intl | ^4.8.4 (installed) | Bilingual UI strings; `useTranslations()` in client, `getTranslations()` in server | Established pattern from Phase 1; all text goes through this |
| @base-ui/react | ^1.3.0 (installed) | RadioGroup, Select primitives | Already powering existing UI components; shadcn wrappers already written |
| motion (framer-motion v12+) | ^12.38.0 (installed) | FadeIn on thank-you screen, section transition animations | Established in project; import from `motion/react` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | installed | Section icons (ShieldCheck, Heart, Scale, Trophy, Users, CheckCircle, AlertCircle) | All icon usage |
| papaparse | installed (via csv.service) | CSV parse/serialize | Not used directly — via csv.service |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React state for form | React Hook Form | RHF adds dependency; 47 questions with simple string values is manageable with useState(Record<string,string>) |
| IntersectionObserver manual | scrollspy library | No scrollspy library in project; IntersectionObserver is native, no dep needed |

**Installation:** No new packages required. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/app/[locale]/survey/
  [token]/
    page.tsx              # Server Component: token validation, data loading
    loading.tsx           # Loading skeleton
    not-found.tsx         # 404 state — missing/expired token
    error.tsx             # Error boundary (optional fallback)

src/components/survey/
  SurveyForm.tsx          # "use client" — main form state machine
  LikertInput.tsx         # "use client" — desktop+mobile radio group
  SectionCard.tsx         # Server-compatible — renders one GPTW section
  TableOfContents.tsx     # "use client" — IntersectionObserver TOC
  MobileProgressBar.tsx   # "use client" — sticky top bar on mobile
  ConfirmationDialog.tsx  # "use client" — submission confirmation
  ThankYouScreen.tsx      # "use client" — post-submit screen with FadeIn

src/app/api/surveys/[id]/submit/
  route.ts                # POST: validate token, append response, markTokenUsed

src/lib/services/
  token.service.ts        # ADD markTokenUsed() — this function is missing
```

### Pattern 1: Server Component Token Validation
**What:** page.tsx runs server-side, validates token and loads data before any client JS runs.
**When to use:** Token is in URL params, so server-side validation is free (no extra roundtrip) and correct for SEO/error states.
**Example:**
```typescript
// src/app/[locale]/survey/[token]/page.tsx
import { notFound } from 'next/navigation';

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = await params;

  // Token lookup requires surveyId; token contains surveyId field
  // Strategy: parse token row to get surveyId, then load survey
  // BUT: validateToken needs surveyId — use a new findTokenByValue() helper
  // OR: embed surveyId in the survey URL structure
  //
  // IMPORTANT: The route is /[locale]/survey/[token]
  // token.service.validateToken(token, surveyId) requires surveyId
  // → Add findToken(token) that reads all token files OR
  // → Change URL to /[locale]/survey/[surveyId]/[token]

  const { survey, questions, tokenRow } = await loadSurveyForToken(token);
  if (!tokenRow) notFound(); // 404 for missing/expired
  // 410 for used token — handled by rendering an error page (see Pattern 3)
}
```

### Pattern 2: Form State with useReducer or useState
**What:** All 47+ question answers stored in a flat `Record<questionId, string>`. Validation errors stored as `Set<questionId>`.
**When to use:** Simple key-value answers; no complex interdependencies between fields.
**Example:**
```typescript
// src/components/survey/SurveyForm.tsx
'use client';
import { useState, useCallback } from 'react';

type Answers = Record<string, string>;  // questionId -> value string

export function SurveyForm({ survey, questions, tokenRow }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // After first failed submit, clear error for this field on change
    if (hasSubmitAttempted) {
      setErrors(prev => { const next = new Set(prev); next.delete(questionId); return next; });
    }
  }, [hasSubmitAttempted]);

  // ...
}
```

### Pattern 3: Token URL Design Resolution
**What:** `validateToken(token, surveyId)` requires `surveyId` but the route is `/[locale]/survey/[token]`. Need a strategy to resolve surveyId from token alone.
**Options:**
1. Add `findTokenByValue(token)` to `token.service.ts` that scans `surveys.csv` for all surveyIds then checks each `tokens-{surveyId}.csv` — correct but O(n surveys)
2. Change route to `/[locale]/survey/[surveyId]/[token]` — cleaner, one lookup, but URL is longer
3. Encode surveyId in the token string (breaking change to existing tokens)
**Recommended:** Option 1 — add `findTokenByValue(token)`. Survey count is small (MVP), the scan is cheap. Avoids breaking existing tokens already sent to employees.

```typescript
// token.service.ts — add this function
export async function findTokenByValue(token: string): Promise<Token | null> {
  const surveys = await readRows<Record<string, string>>('surveys.csv');
  for (const survey of surveys) {
    const rows = await readRows<Record<string, string>>(`tokens-${survey.id}.csv`);
    const row = rows.find(r => r.token === token);
    if (row) {
      return {
        token: row.token,
        surveyId: row.surveyId,
        email: row.email,
        status: row.status as Token['status'],
        createdAt: row.createdAt,
        submittedAt: row.submittedAt || undefined,
      };
    }
  }
  return null;
}
```

### Pattern 4: markTokenUsed() Implementation
**What:** Update a token's status from 'pending' to 'submitted'. CSV has no UPDATE — must read all rows, mutate the target row, write all back.
**Uses `writeRows` (full overwrite) with ETag protection not needed here (sequential submission flow).**
**Example:**
```typescript
// token.service.ts — add this function
export async function markTokenUsed(token: string, surveyId: string): Promise<void> {
  const filename = tokenFile(surveyId);
  const rows = await readRows<Record<string, string>>(filename);
  const updated = rows.map(r =>
    r.token === token
      ? { ...r, status: 'submitted', submittedAt: new Date().toISOString() }
      : r
  );
  await writeRows(filename, updated);
}
```

### Pattern 5: Public Submission API Route
**What:** POST `/api/surveys/[id]/submit` — validates token, appends response CSV row, marks token used.
**No admin session auth** — authenticated by token in request body.
**Example:**
```typescript
// src/app/api/surveys/[id]/submit/route.ts
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: surveyId } = await params;
  const body: { token: string; answers: Record<string, string> } = await request.json();

  // Validate token
  const tokenRow = await validateToken(body.token, surveyId);
  if (!tokenRow) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 410 });
  }

  // Persist response — flatten answers as columns in CSV
  await appendRow(`responses-${surveyId}.csv`, {
    surveyId,
    token: body.token,
    email: tokenRow.email,
    submittedAt: new Date().toISOString(),
    ...body.answers,  // questionId -> value spread into CSV columns
  });

  // Mark token used (prevents resubmission)
  await markTokenUsed(body.token, surveyId);

  return Response.json({ success: true });
}
```

### Pattern 6: IntersectionObserver for TOC Active Section
**What:** Track which section is currently in viewport to highlight the active TOC item.
**Example:**
```typescript
// src/components/survey/TableOfContents.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

export function TableOfContents({ sections }: { sections: SectionMeta[] }) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(section => {
      const el = document.getElementById(`section-${section.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.id); },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());  // CRITICAL: cleanup
  }, [sections]);

  // ...
}
```

### Pattern 7: Locale-Aware Language Switcher for Survey Page
**What:** The existing `LanguageSwitcher` component uses `useRouter().push()` with path replacement. This works for survey pages but will reset scroll position. The UX spec requires form state to be preserved on language switch.
**Solution:** Language toggle in survey form switches a local `displayLocale` state (separate from URL locale) so form state is preserved without navigation. This is a survey-only concern.
```typescript
// SurveyForm.tsx — local language state
const [displayLocale, setDisplayLocale] = useState<'en' | 'my'>(locale as 'en' | 'my');
const q = (question: Question) => displayLocale === 'en' ? question.en : question.my;
```

### Anti-Patterns to Avoid
- **Using `prompt.en` directly in JSX:** Always use the `q(question)` helper that reads `displayLocale` — ensures language switch updates all text.
- **Calling `router.push()` on language toggle:** Would reset form state. Use local `displayLocale` state instead for survey form.
- **Using `appendRow` for token status update:** appendRow adds a new row; token status update requires read-mutate-writeRows.
- **Calling `markTokenUsed` before `appendRow`:** If `appendRow` fails after `markTokenUsed`, the response is lost but the token is consumed. Always persist response first, then mark token used.
- **Forgetting IntersectionObserver cleanup:** Memory leak on unmount. Always return `() => observers.forEach(o => o.disconnect())` from `useEffect`.
- **Sending answers as nested JSON in CSV row:** The `Response.answers` is `Record<string,string>` — spread directly into row columns so each questionId becomes a CSV column. This matches how the analytics phase will read them.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Radio group accessibility | Custom radio inputs with divs | `src/components/ui/radio-group.tsx` (base-ui wrapper) | aria-checked, keyboard nav, data-checked states already handled |
| Select dropdown | Custom dropdown | `src/components/ui/select.tsx` (base-ui wrapper) | Accessible, keyboard navigable, mobile-friendly |
| Confirmation dialog | Custom modal overlay | `src/components/ui/dialog.tsx` | Focus trap, ESC dismiss, backdrop click all handled |
| Progress bar | Custom div width% | `src/components/ui/progress.tsx` | Accessible with role="progressbar" aria-valuenow |
| CSV ETag retry | Custom retry loop | `appendRow` in `csv.service.ts` | Already implements 5-retry ETag loop for Vercel Blob concurrency |
| Fade-in animation | CSS keyframe | `src/components/motion/FadeIn.tsx` | Already uses motion/react with project easing curve |

**Key insight:** All UI primitives are already installed and wrapped. New components should compose existing wrappers, not reach into @base-ui/react directly.

---

## Common Pitfalls

### Pitfall 1: validateToken Requires surveyId But Route Only Has Token
**What goes wrong:** `validateToken(token, surveyId)` needs both parameters, but the URL `/[locale]/survey/[token]` only provides the token. Calling it without a correct `surveyId` always returns null.
**Why it happens:** Token service was designed for admin use where `surveyId` is always known.
**How to avoid:** Add `findTokenByValue(token)` to `token.service.ts` (see Pattern 3) that scans surveys to locate the token. Use this in the page Server Component.
**Warning signs:** Token validation always returning null in the survey route.

### Pitfall 2: markTokenUsed Does Not Exist
**What goes wrong:** CONTEXT.md and FORM-10 reference `markTokenUsed` but this function is absent from `token.service.ts`.
**Why it happens:** It was planned but not yet implemented.
**How to avoid:** Add `markTokenUsed(token, surveyId)` as part of Wave 1 or Wave 0. The submission API route cannot complete without it.
**Warning signs:** TypeScript import error in the submission route.

### Pitfall 3: Response Ordering — Persist Before Invalidate
**What goes wrong:** If `markTokenUsed` is called before `appendRow` succeeds and `appendRow` throws (e.g., Vercel Blob 5xx), the token is consumed but no response is recorded.
**Why it happens:** Order of operations not specified.
**How to avoid:** Always call `appendRow` first; only call `markTokenUsed` after the row is successfully written.
**Warning signs:** Survey responses missing in CSV despite tokens showing as submitted.

### Pitfall 4: Language Switch Resets Form State
**What goes wrong:** Using `router.push()` (like the existing `LanguageSwitcher`) on language toggle navigates away and re-renders the page, clearing all form answers.
**Why it happens:** URL-based locale routing requires navigation to change locale.
**How to avoid:** Use a local `displayLocale` state in `SurveyForm.tsx` instead of URL navigation. The survey form is the only place where this pattern applies.
**Warning signs:** Form answers disappear when toggling EN/MY.

### Pitfall 5: IntersectionObserver Leak
**What goes wrong:** Observer instances accumulate if not disconnected when the component unmounts or re-renders.
**Why it happens:** useEffect without cleanup.
**How to avoid:** Return a cleanup function from `useEffect` that calls `observer.disconnect()` on each observer instance.
**Warning signs:** Memory growing over time on survey page.

### Pitfall 6: Myanmar Script Line Height
**What goes wrong:** Myanmar Unicode text with default Tailwind `leading-normal` (1.5) clips descenders on mobile, making text illegible.
**Why it happens:** Myanmar script requires more vertical space than Latin scripts.
**How to avoid:** Apply `leading-relaxed` (1.625) or inline style `lineHeight: 1.75` on question text when `displayLocale === 'my'`. This is called out explicitly in UX-DESIGN-SPEC.md.
**Warning signs:** Burmese text appears clipped or lines overlap on mobile.

### Pitfall 7: Public Route Must Not Be Behind Admin Auth Guard
**What goes wrong:** The proxy.ts auth guard protects `/[locale]/admin` routes. If the survey route is accidentally nested under admin or the proxy regex is too broad, employees are redirected to login.
**Why it happens:** Regex misconfiguration in proxy.ts.
**How to avoid:** Route is `/[locale]/survey/[token]` — no `/admin` in path, so existing regex `\/(?:en|my)\/admin` won't match. No proxy.ts changes needed. The submission API `/api/surveys/[id]/submit` is also outside the admin guard. Confirm this in testing.
**Warning signs:** Employees reaching a login page instead of the survey form.

### Pitfall 8: answers Spread Into CSV Row — Column Consistency
**What goes wrong:** If different survey submissions have different subsets of answers (e.g., open-ended skipped), CSV rows have inconsistent columns. PapaParse will still handle this but analytics reads may encounter undefined column values.
**Why it happens:** Open-ended questions are optional; demographics may vary.
**How to avoid:** When building the response row for `appendRow`, initialize all known questionIds to empty string first, then merge actual answers. This ensures consistent column headers across all rows.
**Warning signs:** Analytics phase (Phase 4) seeing undefined values for optional question columns.

---

## Code Examples

Verified patterns from project codebase:

### Accessing Dynamic Route Params (Next.js 16)
```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md
// params is always a Promise in Next.js 16
export default async function SurveyPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
}
```

### Server Component + Client Component Split
```typescript
// page.tsx — Server Component (no 'use client')
export default async function SurveyPage({ params }) {
  const { token } = await params;
  const tokenRow = await findTokenByValue(token);
  if (!tokenRow) notFound();
  if (tokenRow.status === 'submitted') {
    // Render 410 error component
    return <TokenUsedError />;
  }
  const survey = await getSurvey(tokenRow.surveyId);
  const questions = await getQuestions(tokenRow.surveyId);
  return <SurveyForm survey={survey!} questions={questions} tokenRow={tokenRow} />;
}

// SurveyForm.tsx — Client Component
'use client';
export function SurveyForm({ survey, questions, tokenRow }: Props) { ... }
```

### Translation Key Pattern (established in Phase 1)
```typescript
// Server: getTranslations()
const t = await getTranslations('survey');
// Client: useTranslations()
const t = useTranslations('survey');
// Key naming: {section}.{key} — e.g. survey.title, survey.submitButton
```

### base-ui RadioGroup Usage (from existing wrapper)
```typescript
// src/components/ui/radio-group.tsx uses base-ui primitives
// data-checked (not checked) on RadioPrimitive.Root
// RadioGroupPrimitive wraps with value/onValueChange
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup value={answers[question.id] ?? ''} onValueChange={(v) => handleAnswer(question.id, v)}>
  {LIKERT_OPTIONS.map(option => (
    <RadioGroupItem key={option.value} value={option.value} />
  ))}
</RadioGroup>
```

### base-ui Select Usage (from existing wrapper)
```typescript
// src/components/ui/select.tsx — SelectPrimitive.Root = Select
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select value={answers['DEM-ORG'] ?? ''} onValueChange={(v) => handleAnswer('DEM-ORG', v)}>
  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
  <SelectContent>
    {question.options?.map(opt => (
      <SelectItem key={opt.en} value={opt.en}>{displayLocale === 'en' ? opt.en : opt.my}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 | Auth guard file must be proxy.ts, not middleware.ts (already done in Phase 1) |
| `params.token` direct access | `await params` (Promise) | Next.js 15+ | params is always a Promise — must await before destructuring |
| `useTranslations` in server | `getTranslations()` in server components | next-intl v4 | Server components must use `getTranslations()`, never `useTranslations()` |

**Deprecated/outdated:**
- `middleware.ts`: Renamed to `proxy.ts` in Next.js 16. Already done; do not create middleware.ts.
- `import from 'framer-motion'`: Package is now `motion`; import from `'motion/react'`. Already correct in project.

---

## Open Questions

1. **Token URL structure — surveyId availability**
   - What we know: `validateToken(token, surveyId)` needs surveyId; current route has only token
   - What's unclear: Whether `findTokenByValue` scan is acceptable (reads all survey token files)
   - Recommendation: Implement `findTokenByValue` — survey count is small at MVP scale, I/O cost is negligible

2. **myanmar-tools Zawgyi/Unicode detection**
   - What we know: STATE.md flags "Zawgyi/Unicode detection (myanmar-tools) integration needs validation on real Android hardware during Phase 3"
   - What's unclear: Whether myanmar-tools is installed or needs installing; whether Zawgyi is a real concern for this form
   - Recommendation: Check `package.json` for myanmar-tools; if not installed, defer — the PDF source text is confirmed Unicode Myanmar; employee devices on modern Android/iOS default to Unicode

3. **Response CSV column schema**
   - What we know: `Response.answers` is `Record<string, string>` spread into CSV row; question IDs are like CAM-01, CRE-02, OE-01, DEM-ORG
   - What's unclear: Whether a fixed column schema should be pre-declared or dynamic (spread)
   - Recommendation: Use spread pattern (dynamic columns) — simpler, works with PapaParse `header: true`, and Phase 4 analytics reads by header name not index (FOUN-03)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (installed, vitest.config.ts present) |
| Config file | `vitest.config.ts` at project root |
| Quick run command | `pnpm test -- --reporter=verbose __tests__/services/token.service.test.ts` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | findTokenByValue resolves token row | unit | `pnpm test -- __tests__/services/token.service.test.ts` | ❌ Wave 0 (add test to existing file) |
| FORM-10 | markTokenUsed sets status=submitted, submittedAt populated | unit | `pnpm test -- __tests__/services/token.service.test.ts` | ❌ Wave 0 (add test to existing file) |
| FORM-11 | appendRow writes response row with all questionId columns | unit | `pnpm test -- __tests__/lib/csv.service.test.ts` | ✅ existing file (add case) |
| FORM-08 | Validation returns errors for unanswered required questions | unit | `pnpm test -- __tests__/survey/validation.test.ts` | ❌ Wave 0 |
| FORM-09 | Submission API returns 410 for used token | unit | `pnpm test -- __tests__/api/submit.test.ts` | ❌ Wave 0 |
| FORM-02..07, 12 | Layout, Likert rendering, demographics, language toggle | manual | Browser review on desktop + mobile viewport | manual-only — React component rendering not covered by Vitest node env |

### Sampling Rate
- **Per task commit:** `pnpm test -- __tests__/services/token.service.test.ts`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/services/token.service.test.ts` — extend with `findTokenByValue` and `markTokenUsed` tests (file exists, add cases)
- [ ] `__tests__/api/submit.test.ts` — covers FORM-09, FORM-10, FORM-11 (new file)
- [ ] `__tests__/survey/validation.test.ts` — covers FORM-08 validation logic extracted as pure function (new file)

---

## Sources

### Primary (HIGH confidence)
- `src/lib/services/token.service.ts` — actual implementation; confirmed markTokenUsed absent
- `src/lib/services/csv.service.ts` — actual implementation; appendRow + writeRows confirmed
- `src/lib/services/survey.service.ts` — getSurvey, getQuestions signatures confirmed
- `src/lib/types.ts` — Response, Token, Question, Survey types confirmed
- `src/proxy.ts` — auth guard regex confirmed; /[locale]/survey/[token] not protected
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` — params is Promise confirmed
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` — notFound() behavior confirmed
- `.planning/UX-DESIGN-SPEC.md` sections 7 and 8 — full component spec, layout, validation strategy

### Secondary (MEDIUM confidence)
- `src/components/ui/radio-group.tsx` — base-ui wrapper API confirmed (data-checked, onValueChange)
- `src/components/ui/select.tsx` — base-ui SelectPrimitive.Root = Select confirmed
- `src/components/LanguageSwitcher.tsx` — useRouter push pattern confirmed; local state override needed for survey

### Tertiary (LOW confidence)
- myanmar-tools status — not verified; package.json check deferred; flagged as open question

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed installed and in use
- Architecture: HIGH — patterns derived from actual codebase, not assumptions
- Pitfalls: HIGH — several discovered from direct code inspection (markTokenUsed missing, validateToken requires surveyId, answer ordering)
- UX spec: HIGH — read directly from UX-DESIGN-SPEC.md sections 7 and 8

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack, 30-day window)
