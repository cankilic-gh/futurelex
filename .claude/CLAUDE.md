# FutureLex - Claude Code Configuration

## Project Overview

Multi-language vocabulary learning app with flashcard sessions, learning plans, and progress tracking. Supports 6 languages (EN, TR, DE, FR, IT, ES) in any pair direction. Local-first with Firebase cloud sync. Lazy-loaded pages for fast navigation. Deployed on Vercel.

## Tech Stack

- **Framework:** React 19.2, TypeScript 5.8, Vite 6.2
- **Styling:** Tailwind CSS (via clsx + tailwind-merge utilities)
- **Animation:** Framer Motion 11
- **Icons:** Lucide React
- **Routing:** React Router DOM 6.22 (BrowserRouter)
- **Auth & DB:** Firebase 12.7 (Auth email/password, Firestore)
- **AI:** Gemini API (key injected via Vite define)
- **Deploy:** Vercel (SPA with catch-all rewrite, `--legacy-peer-deps`)

## Architecture

### Flat source structure (no `src/` directory)
```
futurelex/
  App.tsx              # Root: Router > AuthProvider > PlanProvider > AppContent
  index.tsx            # React entry point
  types.ts             # Language, LearningPlan, Word, UserSavedWord, UserProfile
  index.css            # Minimal (almost empty -- Tailwind handles styling)
  components/
    Flashcard/
      Card.tsx         # Flashcard flip card component
    Layout/
      Background.tsx   # Global animated background
      Navbar.tsx       # Top navigation bar
    ui/
      AppLoader.tsx    # App loading state
      FuturisticLoader.tsx  # Animated loader
      GlassButton.tsx  # Glassmorphism button component
    LanguageSelector.tsx  # Language pair picker
  context/
    AuthContext.tsx     # Firebase auth state (user, signup, login, logout)
    PlanContext.tsx     # Learning plan CRUD, active plan, progress tracking
  services/
    firebase.ts        # Firebase app init (auth + firestore + analytics)
    data.ts            # Static word database (290+ words, 6 languages, 10 levels)
    languages.ts       # Language definitions, validation, name generation
    localStorage.ts    # LocalStorage service for plans, sync status, device ID
    migration.ts       # Legacy data migration (pre-plan structure to plan-based)
  pages/
    Auth.tsx           # Login/signup page
    Dashboard.tsx      # Progress stats and analytics
    FlashcardSession.tsx  # Core learning session with flashcards
    PlanManager.tsx    # Create/manage learning plans
```

### Data flow (local-first)
1. **Optimistic UI:** State updates locally first, Firebase syncs in background (fire-and-forget)
2. **PlanContext** manages all plan CRUD with optimistic updates + background Firestore writes
3. **LocalStorage service** provides offline plan storage, pending sync queue, device ID for guest users
4. **Word database** is fully static in `services/data.ts` -- no API calls needed for vocabulary
5. **Auth-gated features:** Plans require login; guest users get device-scoped local data

### Key patterns
- **Lazy-loaded pages:** All 4 pages use `React.lazy()` for code splitting
- **RequirePlan guard:** Routes `/learn` and `/dashboard` redirect to `/plans` if no active plan
- **Safety timeout:** Plan loading has a 10-second safety timeout to prevent infinite loading
- **Migration service:** Auto-migrates legacy English-Turkish data to plan-based structure on first load
- **Word generation:** Static database with 290+ words across 10 levels, dynamically paired for any source-target language combination

### Firestore structure
```
users/{userId}/
  plans/{planId}           # LearningPlan document
    saved_words/{wordId}   # User's saved/bookmarked words
    completed_words/{wordId}  # Words user has completed
```

### Firestore rules
- Only authenticated users can read/write their own data (`request.auth.uid == userId`)

## Environment Variables

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
GEMINI_API_KEY                     # Injected via vite.config.ts define (not VITE_ prefixed)
```

## Path Aliases

- `@/*` maps to project root (e.g., `@/components/...`, `@/services/...`)
- Configured in both `tsconfig.json` and `vite.config.ts`

## Conventions

- Default export for App; named exports elsewhere
- `const Component: React.FC = () => {}` or function declaration pattern
- Tailwind classes inline with `clsx` + `tailwind-merge` for conditional classes
- Optimistic updates: update local state immediately, fire-and-forget to Firebase
- Context pattern: throw error if hook used outside provider (`usePlan`, `useAuth`)

## Supported Languages

| Code | Language | Native | Flag |
|------|----------|--------|------|
| en | English | English | GB |
| tr | Turkish | Turkce | TR |
| de | German | Deutsch | DE |
| fr | French | Francais | FR |
| it | Italian | Italiano | IT |
| es | Spanish | Espanol | ES |

Word data stored as a single `rawWords` array with all 6 translations per entry. Language pair words generated dynamically via `createWordsForPair()`.

## Known Gotchas

- **Gemini API key is NOT `VITE_` prefixed:** It's injected via `vite.config.ts` `define` block as `process.env.GEMINI_API_KEY` and `process.env.API_KEY`. This is intentional to avoid client-side exposure in source.
- **No Tailwind config file:** Tailwind is configured but there's no visible `tailwind.config.*` in root -- styles may be configured through PostCSS or Vite plugin defaults.
- **`--legacy-peer-deps` required:** React 19 peer dependency conflicts; `vercel.json` installCommand uses `--legacy-peer-deps`.
- **Production console drops:** `vite.config.ts` strips all `console.*` and `debugger` in production builds via esbuild `drop` option.
- **Firebase timeout handling:** PlanContext wraps Firestore calls with `Promise.race` (5s timeout) + 10s safety timeout to prevent infinite loading states.
- **Migration auto-trigger:** On first load after login, if user has no plans but has legacy saved/completed words, migration runs automatically. This is a one-time process.
- **Word IDs are composite:** Format is `{english_lowercase}-{sourceLang}-{targetLang}-{level}-{index}`. Changing the word list order will break existing saved word references.
- **isCreatingPlanRef:** Ref-based guard prevents loadPlans from running during plan creation (avoids race condition with optimistic updates).
- **index.css is nearly empty:** All styling is done via Tailwind utilities inline. Don't expect to find CSS classes here.
- **BrowserRouter (not Hash):** Uses standard BrowserRouter; Vercel SPA rewrite handles deep links.

## Commands

```bash
npm run dev      # Vite dev server on port 3000
npm run build    # Vite build (no tsc step -- noEmit in tsconfig)
npm run preview  # Preview production build
```

## Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component, provider nesting, lazy routes, RequirePlan guard |
| `context/PlanContext.tsx` | Core state: plan CRUD, optimistic updates, Firebase sync |
| `context/AuthContext.tsx` | Firebase auth (email/password) |
| `services/data.ts` | Static vocabulary database (290+ words, 6 languages, 10 levels) |
| `services/languages.ts` | Language definitions, validation, pair name generation |
| `services/localStorage.ts` | Local-first storage: plans, sync queue, device ID |
| `services/migration.ts` | Legacy-to-plan data migration |
| `services/firebase.ts` | Firebase initialization |
| `types.ts` | Core TypeScript interfaces (Language, LearningPlan, Word, etc.) |
| `pages/FlashcardSession.tsx` | Main learning experience |
| `pages/PlanManager.tsx` | Plan creation and management |
| `vite.config.ts` | Path aliases, Gemini key injection, production console stripping |
| `firestore.rules` | Security rules (user-scoped read/write) |
| `vercel.json` | Deploy config with legacy-peer-deps |

## Don't

- Don't change word order in `data.ts` rawWords array -- existing saved word IDs depend on array index
- Don't remove the Firebase timeout/safety-timeout pattern in PlanContext -- Firestore can hang
- Don't add `VITE_` prefix to `GEMINI_API_KEY` -- it's intentionally injected via define block
- Don't remove `--legacy-peer-deps` from vercel.json -- React 19 has peer dep conflicts
- Don't await Firebase writes in optimistic update flows -- they must be fire-and-forget
- Don't remove the migration service -- existing users may still need one-time migration
