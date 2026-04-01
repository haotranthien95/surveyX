# Phase 3: Employee Survey Form - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Employees access their unique survey URL (token-based), complete the bilingual multi-section Likert form with open-ended and demographic questions, and submit. Responses are persisted to CSV partitioned by survey ID and the token is invalidated on submission. The form is a standalone public page — no admin auth required, only token validation.

</domain>

<decisions>
## Implementation Decisions

### Survey Form Layout & Navigation
- Single scrolling page with section cards (not multi-page wizard) — mirrors Google Forms, allows full review before submit
- Desktop: floating TOC on left sidebar, 240px wide, sticky positioned
- Mobile: sticky top bar (56px) with horizontal scrollable section names + linear progress bar
- Section completion tracking via IntersectionObserver on section headers — updates TOC highlight in real-time, shows checkmark when all questions in section answered

### Likert Scale Interaction & Input Types
- Desktop: horizontal radio row, 5 options evenly spaced, 44px minimum touch targets per option
- Mobile: vertical stack, full-width tappable rows (48px height), selected row gets blue-50 bg + blue-200 border
- Open-ended questions: full-width textarea, 4 rows, character count shown below
- Demographics: radio group for Role Type, Select dropdown for Service Year and Organization

### Submission Flow & Token Handling
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

</decisions>

<canonical_refs>
## Canonical References

### Phase 1 & 2 Dependencies
- `src/lib/services/token.service.ts` — validateToken(token) returns Token or null; markTokenUsed(token)
- `src/lib/services/survey.service.ts` — getSurvey(id), getQuestions(surveyId)
- `src/lib/services/csv.service.ts` — appendRow for response persistence
- `src/lib/types.ts` — Survey, Question, Token, Response types
- `src/lib/constants.ts` — GPTW dimension mappings, question structure
- `messages/en.json` + `messages/my.json` — translation files to extend

### UX Design
- `.planning/UX-DESIGN-SPEC.md` — Likert component spec, survey form layout, TOC design, confirmation dialog, mobile progress, Myanmar typography overrides

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/radio-group.tsx` — shadcn RadioGroup for Likert scale
- `src/components/ui/textarea.tsx` — for open-ended questions
- `src/components/ui/select.tsx` — for demographic dropdowns
- `src/components/ui/dialog.tsx` — for confirmation dialog
- `src/components/ui/progress.tsx` — for progress bar
- `src/components/LanguageSwitcher.tsx` — existing locale toggle
- `src/components/motion/FadeIn.tsx` — entrance animation
- `src/components/motion/ScatteredPixels.tsx` — background canvas

### Established Patterns
- next-intl for all translations (useTranslations hook)
- URL-based locale routing (/en/... and /my/...)
- CSV service with ETag retry for data persistence
- Token validation via token.service.ts

### Integration Points
- New route: /[locale]/survey/[token] — public, no auth
- Token lookup → survey + questions fetch → render form
- Response POST → appendRow to responses-{surveyId}.csv → markTokenUsed
- Must NOT be behind admin auth middleware — public route

</code_context>

<specifics>
## Specific Ideas

- Survey question text at 16px (larger than admin 14px) for phone readability
- Myanmar script: line-height 1.75 for question text
- Likert options in Burmese: use translated scale labels from the PDF data
- Anonymous feel — no email shown prominently, just pre-filled in a hidden/readonly field
- Section icons per dimension: ShieldCheck (Credibility), Heart (Respect), Scale (Fairness), Trophy (Pride), Users (Camaraderie)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-employee-survey-form*
*Context gathered: 2026-04-01*
