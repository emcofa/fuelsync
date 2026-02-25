# FuelSync

A full-stack nutrition tracking web application that helps users monitor daily macro intake, search foods, scan barcodes, and get AI-powered meal suggestions.

## Tech Stack

### Frontend
- React 19 + TypeScript (strict) + Vite
- Tailwind CSS v3
- TanStack Query v5 (server state)
- React Hook Form + Zod (form validation)
- Recharts (progress charts)
- Clerk (authentication)
- html5-qrcode (barcode scanning)

### Backend
- Node.js 20+ + Express 5 + TypeScript (strict)
- MySQL 8+ via Kysely query builder
- Clerk (`@clerk/express` for JWT verification)
- OpenAI GPT-4o (AI meal suggestions)

## Features

- **Dashboard** — Daily calorie bar, macro rings (protein/carbs/fat), meal sections with date navigation
- **Food Logging** — Search foods via Open Food Facts, select serving size, log to meals
- **Barcode Scanner** — Camera-based barcode scanning for quick food lookup
- **Custom Foods** — Create and save custom food entries with per-100g macros
- **Favorites** — Heart-toggle on search results, recent foods, and logged entries
- **Recent Foods** — Quick access to previously logged foods
- **Quick Tabs** — Recent / Favorites / This Meal tabs for fast re-logging
- **Macro Targets** — Auto-calculated from profile (TDEE + goal adjustment) or custom override
- **Goal Modes** — Cut, bulk, or maintain with appropriate calorie/macro adjustments
- **Progress Charts** — Weekly calorie and macro trend charts
- **AI Suggestions** — GPT-4o meal suggestions based on remaining macros and dietary preferences
- **Diet Types** — Standard, vegetarian, vegan, pescetarian, keto, paleo
- **Edit Entries** — Update serving size and meal type for logged foods
- **Date Navigation** — Browse past days with calendar picker

## Project Structure

```
client/src/
  components/
    ui/             Reusable UI (Navbar, Layout, FormField, Tooltip)
    food/           Food components (FoodCard, QuickFoodCard, FoodConfirmation,
                    QuickTabsPanel, BarcodeScanner, AddCustomFoodModal, EditFoodModal)
    dashboard/      Dashboard components (CalorieBar, MacroRing, MacroRingWithTooltip,
                    MealSection, DateNavigator, MiniCalendar, WeeklyChart)
    goals/          Goal mode and macro editor
    ai/             AI suggestion panel
  pages/            Dashboard, FoodLog, Goals, Profile, Progress
  hooks/            Custom hooks (useDailyLog, useFoodSearch, useBarcodeScanner,
                    useFavorites, useFavoriteToggle, useRecentFoods, etc.)
  lib/              Utilities (api.ts, tdee.ts, macroConversions.ts, validators.ts)
  types/            Shared TypeScript types and query keys

server/src/
  routes/           Route registration (user, goals, food, search, favorites, ai)
  controllers/      Request/response handling
  services/         Business logic
  db/               Kysely connection, types, and query files
  middleware/       Auth, validation, error handling
  lib/              TDEE calculations

server/migrations/  SQL migration files
```

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8+
- Clerk account (for authentication)
- OpenAI API key (for AI suggestions)

### Environment Variables

**server/.env**
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

**client/.env**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3001
```

### Setup

1. Clone the repository
2. Run SQL migrations in `server/migrations/` (in order: 001 through 006)
3. Install dependencies and start both servers:

```bash
# Server
cd server
npm install
npm run dev

# Client (separate terminal)
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| GET | `/api/goals` | Get macro targets |
| PUT | `/api/goals` | Update macro targets (custom) |
| POST | `/api/goals/reset` | Reset to calculated targets |
| POST | `/api/food/log` | Log a food entry |
| GET | `/api/food/log/today?date=YYYY-MM-DD` | Get daily food log |
| GET | `/api/food/log/week` | Get weekly food log |
| PUT | `/api/food/log/:id` | Update a food entry |
| DELETE | `/api/food/log/:id` | Delete a food entry |
| GET | `/api/food/recent` | Get recently logged foods |
| GET | `/api/search/food?q=query` | Search foods (Open Food Facts) |
| GET | `/api/search/barcode/:code` | Barcode lookup |
| POST | `/api/search/custom` | Create custom food |
| GET | `/api/favorites` | Get user favorites |
| POST | `/api/favorites` | Add a favorite |
| DELETE | `/api/favorites/:id` | Remove a favorite |
| POST | `/api/ai/suggest` | Get AI meal suggestions |

## Search

Food search uses the [Open Food Facts Elasticsearch API](https://search.openfoodfacts.org) filtered to Sweden. Results are ranked by relevance scoring with diacritic normalization (handles Swedish characters like a, o, a). Custom user-created foods are merged into results with priority over Open Food Facts matches.
