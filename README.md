# FuelSync

A full-stack nutrition tracking web application. Track meals, set macro targets, scan barcodes, and get AI-powered meal suggestions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript (strict) + Tailwind CSS v3 |
| State | TanStack Query v5 (server state), Zustand (client state) |
| Forms | react-hook-form + Zod |
| Charts | Recharts |
| Backend | Node.js 20+ + Express 5 + TypeScript (strict) |
| Database | MySQL 8+ via mysql2 + Kysely query builder |
| Auth | Clerk (client + server) |
| AI | OpenAI GPT-4o (server-side only) |

## Features

- **Food search** — Open Food Facts Elasticsearch API with relevance scoring and diacritic normalization
- **Barcode scanner** — Camera-based barcode scanning for quick food lookup
- **Food logging** — Search, select serving size, log to breakfast/lunch/dinner/snack
- **Custom foods** — Create and save custom food entries with per-100g macros
- **Favorites** — Heart-toggle on search results, recent foods, and logged entries
- **Recent foods** — Quick access to previously logged foods
- **Quick tabs** — Recent / Favorites / This Meal tabs for fast re-logging
- **Macro tracking** — Daily calorie bar and protein/carbs/fat ring charts with tooltips
- **Goal modes** — Cut (deficit), bulk (surplus), or maintain with auto-calculated TDEE targets
- **Custom targets** — Override any macro target manually
- **Edit entries** — Update serving size and meal type for logged foods
- **Date navigation** — Browse past and future days with a calendar picker
- **Meal organisation** — Log food to breakfast, lunch, dinner, or snack
- **Weekly progress** — 7-day charts for calories and macros
- **AI suggestions** — GPT-4o powered meal recommendations based on remaining macros, goal mode, and diet type
- **Diet types** — Standard, vegetarian, vegan, pescetarian, keto, paleo

## Prerequisites

- Node.js 20+
- MySQL 8+
- A [Clerk](https://clerk.com) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key (for AI suggestions)

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/emcofa/fuelsync.git
cd fuelsync
```

### 2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Configure environment variables

**Server** — create `server/.env`:

```env
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

**Client** — create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3001
```

### 4. Create the database and run migrations

```bash
mysql -u root -e "CREATE DATABASE fuelsync;"
mysql -u root fuelsync < server/migrations/001_create_users.sql
mysql -u root fuelsync < server/migrations/002_create_macro_targets.sql
mysql -u root fuelsync < server/migrations/003_create_food_entries.sql
mysql -u root fuelsync < server/migrations/004_create_custom_foods.sql
mysql -u root fuelsync < server/migrations/005_create_user_favorites.sql
mysql -u root fuelsync < server/migrations/006_add_default_serving_to_custom_foods.sql
```

### 5. Start the dev servers

In two separate terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

The client runs at `http://localhost:5173` and the server at `http://localhost:3001`.

## Project Structure

```
client/src/
  components/
    ui/             Shared components (Navbar, Layout, FormField, Tooltip)
    dashboard/      CalorieBar, MacroRing, MacroRingWithTooltip, MealSection,
                    DateNavigator, MiniCalendar, WeeklyChart
    food/           FoodSearchBar, FoodCard, QuickFoodCard, FoodConfirmation,
                    QuickTabsPanel, FoodLogItem, BarcodeScanner,
                    AddCustomFoodModal, EditFoodModal
    goals/          GoalModeCard, MacroEditor
    ai/             AISuggestionPanel
  pages/            Dashboard, FoodLog, Goals, Profile, Progress
  hooks/            useDailyLog, useFoodSearch, useBarcodeScanner, useMacroTargets,
                    useWeeklyProgress, useRecentFoods, useFavorites,
                    useFavoriteToggle, useAISuggestion
  lib/              api.ts, tdee.ts, macroConversions.ts, validators.ts,
                    mealRecommendations.ts
  store/            Zustand stores
  types/            Shared TypeScript types and query keys

server/src/
  routes/           Route registration (user, goals, food, search, favorites, ai)
  controllers/      Request/response handling
  services/         Business logic
  db/
    connection.ts   MySQL pool + Kysely instance
    types.ts        Kysely Database interface
    queries/        Typed query functions (user, goals, food, customFoods, favorites)
  middleware/       requireAuth, validateBody, errorHandler
  lib/              Utilities (tdee.ts)

server/migrations/  SQL migration files (001–006)
```

See [client/README.md](client/README.md) and [server/README.md](server/README.md) for detailed docs including API routes and component breakdowns.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full architecture document including database schema, API contracts, data flow diagrams, and conventions.

## License

Private — all rights reserved.
