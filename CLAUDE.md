# CLAUDE.md — FuelSync

This file is the source of truth for how Claude Code should behave when working in this project.
Read this fully before generating any code, file, or suggestion.

---

## Project Context

FuelSync is a full-stack nutrition tracking web application. The stack is:

- **Frontend:** React 18 + Vite + TypeScript (strict) + Tailwind CSS v3
- **Backend:** Node.js 20+ + Express 4 + TypeScript (strict)
- **Database:** MySQL 8+ via `mysql2` and `Kysely` query builder
- **Auth:** Clerk (`@clerk/clerk-react` on client, `@clerk/express` on server)
- **State:** TanStack Query v5 for server state, Zustand for client state
- **Forms:** `react-hook-form` + `zod`
- **Charts:** Recharts
- **AI:** OpenAI GPT-4o via server-side route only

The full architecture is documented in `ARCHITECTURE.md`. Always consult it when creating files, routes, or DB queries.

---

## TypeScript Rules

- `strict: true` is enabled in all `tsconfig.json` files — never disable it
- **No `any`** anywhere in the codebase — use `unknown` and narrow it, or define a proper type
- Use `type` over `interface` unless interface merging is explicitly needed
- All props, API responses, hook return values, and internal state must be explicitly typed
- Do not infer types from `fetch` responses — always cast to a typed shape or use a typed wrapper
- Use generics for reusable hooks, utilities, and components (e.g., `apiFetch<T>`)
- Use discriminated unions for variant-based logic (e.g., `GoalMode`, `MealType`)
- Group related types in `types/index.ts` — do not scatter type definitions across files

---

## React Rules

### Component Style

- Functional components only — no class components
- Use RAFCE style (arrow function + default export):

```tsx
// ✅ Correct
const FoodCard = ({ food }: FoodCardProps) => {
  return <div>...</div>;
};

export default FoodCard;
```

- One component per file — no exceptions
- File names: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utilities

### State Management

- `useState` — simple, isolated, single-component state only
- `useReducer` — when state has multiple related fields or complex transitions (e.g., food log form)
- `useContext` — only when state truly needs to be shared across deeply nested unrelated components; prefer Zustand instead
- **Zustand** — for lightweight global client state (auth session, active goal mode)
- **TanStack Query** — for ALL server state (food logs, macro targets, user profile); do not replicate this in Zustand or useState

### Custom Hooks

Extract logic into a custom hook when:
- The same logic or data fetching pattern is used in more than one component
- A component's logic grows beyond ~30 lines and can be cleanly separated
- A side effect has meaningful dependencies worth isolating

Hooks live in `client/src/hooks/`. Name them `use[Feature].ts`.

### useEffect Rules

- Avoid `useEffect` for data fetching — use TanStack Query instead
- When `useEffect` is necessary, only include **primitive** values as dependencies (strings, numbers, booleans)
- Never pass raw objects, arrays, or functions as dependencies unless they are memoized with `useMemo` / `useCallback`
- Never use `useEffect` to sync state — if you find yourself doing this, rethink the data flow

### Performance

- Use `useMemo` for expensive computations (e.g., calculating remaining macros from a list of entries)
- Use `useCallback` for functions passed as props to memoized child components
- Do not use `useMemo` or `useCallback` preemptively — only add them when there is a measurable reason
- Do not create new objects or arrays inline in JSX props if the child component uses `React.memo`

### TanStack Query

- Always handle three states: `isLoading`, `isError`, `data` — never assume data is available
- Use the centralized `queryKeys` object from `types/index.ts` for all query keys — never hardcode strings inline
- Invalidate query cache after mutations using `queryClient.invalidateQueries`
- Use `useMutation` for all POST/PUT/DELETE operations — do not call `apiFetch` directly in event handlers

---

## API & Data Fetching Rules

- All API calls go through `client/src/lib/api.ts` — never call `fetch` directly in a component or hook
- Never use Axios — use the `apiFetch` wrapper
- The `apiFetch` wrapper automatically injects the Clerk session token as a Bearer header
- Always handle: loading state, error state, empty/null state — never leave any of these implicit
- API base URL comes from `import.meta.env.VITE_API_BASE_URL` — never hardcode `localhost`

---

## Backend Rules

### Layer Separation (strict — do not violate)

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Route | `routes/*.ts` | Register path + method, apply middleware, call controller |
| Controller | `controllers/*.ts` | Parse req, call service, send res — no business logic |
| Service | `services/*.ts` | All business logic — no Express `req`/`res` objects |
| Query | `db/queries/*.ts` | SQL/Kysely queries only — no logic |

If you are writing logic in a route handler, move it to a service.
If you are writing a DB call in a controller, move it to a query file.

### Route Rules

- Every POST/PUT route must have `validateBody(schema)` middleware applied before the controller
- Every protected route must have `requireAuth` middleware applied
- Route paths use `kebab-case` and follow REST conventions (nouns, not verbs)

### Error Handling

- All async route handlers must wrap logic in try/catch and call `next(err)` on failure
- Do not call `res.status(500).json(...)` directly in controllers — throw and let `errorHandler` middleware handle it
- Use this error shape consistently: `{ "error": "message" }` for general errors, `{ "errors": { "fieldErrors": {...} } }` for validation errors

### Database

- Use Kysely for all queries — no raw SQL strings except in migration files
- The Kysely `Database` interface in `db/types.ts` must stay in sync with the actual schema at all times
- Column names in MySQL are `snake_case`; TypeScript types are `camelCase` — always map between them explicitly
- Never SELECT `*` — always select only the columns you need
- Always use parameterised queries — never interpolate user input into query strings

---

## Folder Conventions

```
client/src/
  assets/           Static assets (images, icons)
  components/
    ui/             Base reusable components (Button, Card, Input, Modal, Spinner, Badge)
    food/           Food-specific components
    dashboard/      Dashboard display components
    goals/          Goal mode and macro editor components
    ai/             AI suggestion components
  pages/            One file per route
  hooks/            Custom hooks only — no components
  lib/              Utilities (api.ts, tdee.ts, validators.ts)
  store/            Zustand stores only
  types/            Shared TypeScript types

server/src/
  routes/           Route registration only
  controllers/      Request/response handling only
  services/         Business logic
  db/
    connection.ts   DB pool + Kysely instance
    types.ts        Kysely Database interface
    queries/        Typed query functions per domain
  middleware/       Express middleware
  lib/              Pure utilities (tdee.ts)
  types/            Shared server types

server/migrations/  SQL migration files (001_create_users.sql, etc.)
```

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| React component files | PascalCase | `FoodCard.tsx` |
| Hook files | camelCase | `useDailyLog.ts` |
| Utility files | camelCase | `tdee.ts`, `api.ts` |
| TypeScript types | PascalCase | `FoodEntry`, `GoalMode` |
| DB columns | snake_case | `protein_g`, `logged_at` |
| API routes | kebab-case | `/api/food/log`, `/api/ai/suggest` |
| Env variables | SCREAMING_SNAKE_CASE | `CLERK_SECRET_KEY` |
| Zustand stores | camelCase with Store suffix | `authStore.ts` |
| TanStack query keys | camelCase via `queryKeys` object | `queryKeys.dailyLog(date)` |

---

## Tailwind Rules

- Use Tailwind utility classes only — no custom CSS files unless absolutely unavoidable
- Do not use inline `style={{}}` for anything that can be expressed with Tailwind
- For conditional classes, use the `clsx` or `cn` utility — do not use template literals with ternaries
- Design should feel modern and polished — never amateurish or default-looking
- Follow spacing consistency: use the Tailwind spacing scale (4, 8, 12, 16, 24, 32px etc.), do not use arbitrary values like `p-[13px]` unless there is no alternative
- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`) — never use `<div>` for everything
- All interactive elements must have accessible focus states — do not remove `outline` without replacing it

---

## Accessibility Rules

- All form inputs must have associated `<label>` elements (not just placeholders)
- All images must have meaningful `alt` text — never `alt=""`  unless purely decorative
- All icon-only buttons must have `aria-label`
- Keyboard navigation must work for all interactive elements
- Do not use colour alone to convey information (e.g., always pair colour with an icon or text label for macro status)

---

## Code Quality Rules

- **DRY:** If the same logic appears in two places, extract it to a hook or utility. Do not copy-paste.
- **KISS:** Prefer the simpler solution. Do not introduce abstractions preemptively.
- **Single Responsibility:** Every file, component, hook, service, and function does one thing.
- **Guard clauses:** Use early returns instead of deeply nested if/else blocks.
- **Comments:** Only comment non-obvious logic. Do not comment what the code already says clearly. Write code that reads like documentation.
- **No magic numbers:** Define constants with meaningful names (e.g., `CALORIE_DEFICIT_CUT = 400` not `tdee - 400`).

---

## Domain-Specific Rules

### Macro Calculations

- All TDEE and macro calculations use the logic in `server/src/lib/tdee.ts` — this is the authoritative source
- The client mirrors this logic in `client/src/lib/tdee.ts` for real-time UI preview only
- Never recalculate macros inline in a component or controller — always call the `computeMacroTargets` function
- Calories are stored as `INT` (whole numbers). Protein, carbs, fat are stored as `DECIMAL(6,2)`.
- Macro split constants (`GOAL_CALORIE_ADJUSTMENTS`, `ACTIVITY_MULTIPLIERS`) are defined once in `lib/tdee.ts` — never duplicated

### Food Entries

- All food entries store the **actual** macro values (not per-100g) — the controller performs the `per100g * servingG / 100` calculation before insert
- All timestamps are stored in **UTC** in MySQL
- The `GET /api/food/log/today` route accepts an optional `?date=YYYY-MM-DD` query param in the user's local date; the server converts to a UTC range for the DB query
- Never filter "today's entries" on the client — always query with a date param from the server

### Clerk Auth

- Access the Clerk `userId` in controllers via `getAuth(req).userId` from `@clerk/express`
- The Clerk `userId` is the primary key in the `users` table and the foreign key across all tables
- On every authenticated request, the `syncUserMiddleware` ensures the user exists in MySQL — this is the lazy sync pattern
- Never store sensitive user data in Clerk metadata — store it in MySQL. Clerk metadata is not used in this project.

### Open Food Facts

- All calls to Open Food Facts are made server-side via the `/api/search` routes — never from the client directly
- Always normalize Open Food Facts responses through the `normalizeOpenFoodFacts()` function in `search.service.ts` before returning to the client
- Filter out results where `caloriesPer100g` is 0 or null after normalisation — do not return incomplete food data

### AI Suggestions

- The OpenAI API key is server-side only — never expose it to the client under any circumstances
- Always wrap `JSON.parse` on OpenAI responses in try/catch — if parsing fails, return HTTP 502 to the client
- The AI prompt must include `dietType` context — if the user is vegetarian/vegan/etc., the prompt must explicitly state this constraint
- AI suggestions are never saved to the database automatically — the user must manually log them if they choose

---

## What NOT to Do

- Do not use `any` — ever
- Do not call `fetch` directly in components — use `apiFetch`
- Do not put business logic in controllers
- Do not put DB queries in services
- Do not use raw SQL strings in application code (only in migration files)
- Do not call OpenAI from the frontend
- Do not store timestamps in local time — always UTC
- Do not auto-recalculate macro targets when `is_custom = true`
- Do not use `WidthType.PERCENTAGE` in any table (docx rule — not applicable here, ignore)
- Do not use `useEffect` for data fetching — use TanStack Query
- Do not hardcode `localhost` or port numbers in application code — use environment variables
- Do not duplicate the TDEE calculation logic — it lives in `lib/tdee.ts` on both client and server
- Do not SELECT `*` from any table — always specify columns

---

## Environment Variable Reference

### `server/.env`

```
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=fuelsync
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
```

### `client/.env`

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3001
```

---

## Build Order Reference

When building from scratch, follow this sequence:

1. Init client (Vite + React + TS + Tailwind) and server (Express + TS)
2. Set up Clerk in both client and server — verify auth handshake works
3. Implement `requireAuth` middleware + `syncUserMiddleware` + lazy user sync
4. Implement `apiFetch` wrapper on client
5. Run all SQL migrations
6. Build profile routes + Profile page (all body stats fields)
7. Implement `computeMacroTargets` in `lib/tdee.ts`
8. Build goals routes + Goals page (goal mode selector + macro override)
9. Build `/api/search/food` proxying Open Food Facts
10. Build food log routes + FoodLog page (search, serving input, meal type)
11. Build Dashboard (calorie bar, macro rings, meal sections)
12. Build `DELETE /api/food/log/:id`
13. Build `/api/food/log/week` + Progress page (Recharts charts)
14. Build barcode scanner (`BarcodeScanner.tsx` + `/api/search/barcode/:code`)
15. Build AI suggestions (`/api/ai/suggest` + `AISuggestionPanel.tsx`)

Do not jump ahead. Each phase depends on the previous.

---

## Current Build Status

All 15 build phases are complete. Below is every file created or modified, with a one-line description.

### Server — `server/src/`

| File | Description |
|------|-------------|
| `index.ts` | Express entry point — registers middleware, all 5 route groups, error handler |
| `db/connection.ts` | Lazy-initialized Kysely instance via Proxy (defers pool creation until after dotenv) |
| `db/types.ts` | Kysely `Database` interface mirroring all 4 MySQL tables |
| `db/queries/user.queries.ts` | findById, create (idempotent with onDuplicateKeyUpdate), updateProfile |
| `db/queries/goals.queries.ts` | findByUserId, upsert (check-then-insert-or-update) |
| `db/queries/food.queries.ts` | insert, findById, findByUserAndDateRange, deleteById |
| `middleware/requireAuth.ts` | Clerk JWT verification + lazy user sync via syncUserMiddleware |
| `middleware/validateBody.ts` | Zod schema validation middleware for POST/PUT routes |
| `middleware/errorHandler.ts` | Global Express error handler |
| `lib/tdee.ts` | BMR (Mifflin-St Jeor), TDEE, goal adjustment, macro split — authoritative source |
| `routes/user.ts` | GET/PUT `/api/user/profile` |
| `routes/goals.ts` | GET/PUT `/api/goals`, POST `/api/goals/reset` |
| `routes/food.ts` | POST `/api/food/log`, GET `/api/food/log/today`, GET `/api/food/log/week`, DELETE `/api/food/log/:id` |
| `routes/search.ts` | GET `/api/search/food`, GET `/api/search/barcode/:code` |
| `routes/ai.ts` | POST `/api/ai/suggest` with zod validation |
| `controllers/user.controller.ts` | getProfile, updateProfile — req/res only |
| `controllers/goals.controller.ts` | getGoals, updateGoals, resetGoals — req/res only |
| `controllers/food.controller.ts` | logFood (per100g×factor calc), getDailyLog, getWeeklyLog, deleteEntry |
| `controllers/search.controller.ts` | searchFood, searchBarcode — req/res only |
| `controllers/ai.controller.ts` | suggest handler with 502 error handling for parse failures |
| `services/user.service.ts` | syncUser (lazy create), getProfile, updateProfile (triggers macro recalc if not custom) |
| `services/goals.service.ts` | getGoals, updateGoals (sets is_custom=true), resetGoals (recalculates from profile) |
| `services/food.service.ts` | logFood, getDailyLog (UTC date range), getWeeklyLog (last 7 days), deleteEntry |
| `services/search.service.ts` | Dual-API: Livsmedelsverket (cached full dataset, local search, parallel nutrient fetches) with Open Food Facts Sweden-filtered fallback; barcode via OFF only |
| `services/ai.service.ts` | Lazy OpenAI client, buildPrompt (includes dietType), suggest (GPT-4o, JSON.parse in try/catch) |

### Server — `server/migrations/`

| File | Description |
|------|-------------|
| `001_create_users.sql` | users table with Clerk userId as PK, body stats, goal_type, diet_type |
| `002_create_macro_targets.sql` | macro_targets table with is_custom flag, one row per user |
| `003_create_food_entries.sql` | food_entries table with per-serving macros, meal_type enum, UTC logged_at |
| `004_create_custom_foods.sql` | custom_foods table for user-defined foods (not yet used in app) |

### Client — `client/src/`

| File | Description |
|------|-------------|
| `main.tsx` | React root with ClerkProvider |
| `App.tsx` | QueryClientProvider + token provider setup + AppRouter |
| `router.tsx` | BrowserRouter with ProtectedRoute wrapper (Clerk auth check) + Layout shell |
| `types/index.ts` | All shared types (GoalMode, MealType, UserProfile, MacroTargets, FoodEntry, FoodSearchResult, etc.), queryKeys object, MEAL_LABELS constant |
| `lib/api.ts` | apiFetch\<T\> wrapper with Clerk Bearer token injection |
| `lib/tdee.ts` | Client mirror of server TDEE calculation for real-time UI preview |
| `lib/validators.ts` | profileSchema + ProfileFormValues with zod |
| `hooks/useDailyLog.ts` | TanStack Query hook for GET /api/food/log/today |
| `hooks/useMacroTargets.ts` | TanStack Query hook for GET /api/goals |
| `hooks/useWeeklyProgress.ts` | TanStack Query hook for GET /api/food/log/week |
| `hooks/useFoodSearch.ts` | TanStack Query hook with 400ms debounce, 5-min staleTime, placeholderData |
| `hooks/useAISuggestion.ts` | useMutation hook for POST /api/ai/suggest |
| `components/ui/Navbar.tsx` | Desktop top nav (indigo bar, links, sign out) + mobile bottom tab bar with icons |
| `components/ui/Layout.tsx` | Shared layout wrapper — Navbar + centered main content area |
| `components/food/FoodSearchBar.tsx` | Live search input (no submit button), optional inline spinner via isLoading prop |
| `components/food/FoodCard.tsx` | Search result card with name, rounded macros per 100g, image |
| `components/food/FoodLogItem.tsx` | Logged food entry row with delete button |
| `components/food/BarcodeScanner.tsx` | Camera modal using html5-qrcode for barcode scanning |
| `components/goals/GoalModeCard.tsx` | Cut/Bulk/Maintain selector card |
| `components/goals/MacroEditor.tsx` | Override individual macro targets with save/reset |
| `components/dashboard/CalorieBar.tsx` | Horizontal calorie progress bar |
| `components/dashboard/MacroRing.tsx` | Circular progress ring for protein/carbs/fat |
| `components/dashboard/MealSection.tsx` | Meal group with entries, delete, and "Add food" button linking to /food?meal={type} |
| `components/dashboard/WeeklyChart.tsx` | Recharts LineChart for weekly macro trends |
| `components/ai/AISuggestionPanel.tsx` | Meal type selector + "Get Suggestions" button + AI suggestion cards |
| `pages/Dashboard.tsx` | Calorie bar, macro rings, meal sections, AI panel; welcome state when no profile |
| `pages/FoodLog.tsx` | Meal tab bar (URL-synced), food search, serving input, log mutation with success toast |
| `pages/Goals.tsx` | Goal mode cards + macro editor with custom/reset |
| `pages/Profile.tsx` | react-hook-form + zod profile form with all body stats fields |
| `pages/Progress.tsx` | Weekly avg stats + 4 Recharts LineCharts |

### Client — `client/public/`

| File | Description |
|------|-------------|
| `fuelsync.svg` | App favicon/logo (person + lightning bolt + apple in pin shape) |

### Client — `client/`

| File | Description |
|------|-------------|
| `index.html` | Entry HTML — title "FuelSync", favicon points to fuelsync.svg |
