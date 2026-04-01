# Phase 1: Foundation - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the non-retroactive infrastructure that every downstream feature depends on: Next.js 15 App Router project scaffolding, TypeScript types and GPTW dimension constants, Vercel Blob StorageAdapter with ETag concurrency control, iron-session admin authentication with middleware protection, and next-intl bilingual routing (English + Burmese) with Noto Sans Myanmar font. The deliverable is a deployable Vercel skeleton with auth-gated admin shell, working bilingual routing, and production-safe CSV read/write.

</domain>

<decisions>
## Implementation Decisions

### Admin Login UX
- Centered card layout with project logo/name on a clean white page
- Session duration: 24 hours, persists across tabs via iron-session encrypted cookie
- Login error: inline error message below the form, generic "Invalid credentials" (no credential enumeration)
- No "remember me" checkbox — always require login after session expiry (security for admin panel)
- Redirect to /admin/dashboard after successful login

### i18n Locale Strategy
- Default locale: English (/en) — admin interface defaults to English
- URL structure: path-based /[locale]/... routing via next-intl (SSR-safe, no hydration mismatch)
- Language switcher: top-right header area, visible on both admin and public survey pages
- Fallback: English for any missing Burmese translation keys (graceful degradation)
- Locale detection: URL path only, not browser Accept-Language (deterministic, cacheable)
- Myanmar font: Noto Sans Myanmar Variable loaded via @fontsource, applied when locale is `my`

### GPTW Question Mapping
- Question IDs use dimension prefix + sequential number: CAM-01 through CAM-08, CRE-09 through CRE-17, FAI-18 through FAI-25, PRI-26 through PRI-35, RES-36 through RES-46, UNC-47 (uncategorized GPTW statement)
- Sub-pillar assignments included from day one in lib/constants.ts (e.g., Credibility → Communication, Competence, Integrity)
- Open-ended questions (OE-01, OE-02) and demographic fields (DEM-ORG, DEM-YEAR, DEM-ROLE) also defined in constants
- Source data: hard-coded from the YFS Culture Survey PDF (46 Likert statements + 2 open-ended + 3 demographics); Excel import in Phase 2 can add/override
- Scoring: 1-5 Likert stored as integers; % favorable = (count of 4 + count of 5) / total responses × 100
- Both English and Burmese text stored per question in the constants file

### Admin Shell Layout
- Collapsible sidebar with icon + text labels (collapses to icons on narrow screens)
- Phase 1 navigation items: Dashboard, Surveys, Settings — only sections that will exist
- Dashboard shows a welcome/onboarding card with setup checklist when no surveys exist (guides admin to configure SMTP first, then create survey)
- Color scheme: white background, blue accent color (professional, aligns with bank branding and user's "clean, white, simple" requirement)
- shadcn/ui components for all admin UI primitives (buttons, cards, forms, sidebar)
- Responsive: sidebar collapses to hamburger menu on mobile

### Claude's Discretion
- Exact Tailwind color tokens and spacing scale
- StorageAdapter interface design details
- Middleware implementation specifics (jose JWT vs iron-session cookie check)
- Project directory structure within src/ or app/
- Dev vs production environment variable naming
- Loading skeleton patterns
- Error page designs (404, 500)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Survey Data Source
- `assets/YFS Culture Survey_Statements_March 2026_FINAL_25032026.pdf` — Defines all 46 Likert statements, 2 open-ended questions, and 3 demographic fields with both English and Burmese text. This is the authoritative source for lib/constants.ts question mapping.

### Prior Survey Results (Chart Reference)
- `assets/2023 Employee Survey_Company Results_July 2023_FINAL v2[29].odp` — Contains the chart types and dashboard layout that Phase 4 must replicate. Not directly needed for Phase 1 but informs the data model structure.

### Project Planning
- `.planning/PROJECT.md` — Project vision, constraints (CSV storage, static auth, bilingual), and key decisions
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: FOUN-01 through FOUN-06, AUTH-01 through AUTH-04, UIUX-01/03/04, DATA-02
- `.planning/research/STACK.md` — Verified technology stack with versions: Next.js 15.2.4, Chart.js 4.5.1, next-intl 4.8.3, iron-session 8, Tailwind CSS 4, shadcn/ui, Vercel Blob, papaparse, Noto Sans Myanmar
- `.planning/research/ARCHITECTURE.md` — Component boundaries, route group structure ((admin) vs (public)), StorageAdapter pattern, build order
- `.planning/research/PITFALLS.md` — Critical Phase 1 pitfalls: Vercel read-only filesystem, concurrent CSV writes, i18n hydration mismatch, CSV schema drift

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established in this phase (StorageAdapter, route groups, i18n config)

### Integration Points
- Vercel deployment target — ensure vercel.json or next.config.js compatible
- CSV files will be the shared data layer consumed by all subsequent phases

</code_context>

<specifics>
## Specific Ideas

- User wants "clean, white, simple, easy to readable font" — this drives the entire visual language
- "Some animation noises in background to improve UX" — subtle, not distracting; deferred to Phase 4 but foundation should not block CSS animations
- Survey data from YFS Culture Survey PDF has Myanmar script in Burmese Unicode encoding — all 46 statements have parallel English/Burmese text
- Two organizations in demographics: Wave Money and Yoma Bank (ရိုးမဘဏ်)
- Service year ranges: <1, 1-3, 3-5, 5-10, 10-20, 20+ years
- Role types: Individual Contributor, People Manager

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-01*
