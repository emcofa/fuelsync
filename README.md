# FuelSync

A full-stack nutrition tracking web application inspired by Lifesum. Track meals, set macro targets, scan barcodes, and get AI-powered meal suggestions.

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

- **Food logging** — Search the Livsmedelsverket database (Swedish food data) with Open Food Facts fallback, or scan barcodes
- **Macro tracking** — Daily calorie bar and protein/carbs/fat ring charts
- **Goal modes** — Cut (deficit), bulk (surplus), or maintain with auto-calculated TDEE targets
- **Custom targets** — Override any macro target manually
- **Date navigation** — Browse past and future days with a calendar picker
- **Meal organisation** — Log food to breakfast, lunch, dinner, or snack
- **AI suggestions** — GPT-4o powered meal recommendations based on remaining macros, goal mode, and diet type
- **Diet types** — Standard, vegetarian, vegan, pescetarian, keto, paleo
- **Barcode scanner** — Scan product barcodes to quickly log food
- **Weekly progress** — 7-day charts for calories and macros

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
  components/       UI components organised by domain
    ui/             Shared components (Navbar, Layout)
    dashboard/      CalorieBar, MacroRing, MealSection, DateNavigator, MiniCalendar
    food/           FoodSearchBar, FoodCard, FoodLogItem, BarcodeScanner
    goals/          GoalModeSelector, MacroEditor
    ai/             AISuggestionPanel
  pages/            One file per route (Dashboard, FoodLog, Goals, Profile, Progress)
  hooks/            Custom hooks (useDailyLog, useFoodSearch, useMacroTargets, etc.)
  lib/              Utilities (api.ts, tdee.ts)
  store/            Zustand stores
  types/            Shared TypeScript types

server/src/
  routes/           Route registration
  controllers/      Request/response handling
  services/         Business logic
  db/
    connection.ts   MySQL pool + Kysely instance
    types.ts        Kysely Database interface
    queries/        Typed query functions
  middleware/       requireAuth, syncUser, validateBody, errorHandler
  lib/              Utilities (tdee.ts)

server/migrations/  SQL migration files
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full architecture document including database schema, API contracts, data flow diagrams, and conventions.

## License

Private — all rights reserved.
