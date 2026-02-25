# FuelSync — Server

Express + TypeScript backend for the FuelSync nutrition tracking application.

## Tech Stack

- Node.js 20+ / Express 5 / TypeScript (strict)
- MySQL 8+ via `mysql2` + Kysely query builder
- Clerk (`@clerk/express`) for JWT authentication
- OpenAI GPT-4o for AI meal suggestions
- Zod for request validation

## Architecture

The server follows a strict layered architecture:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Route | `src/routes/` | Register path + method, apply middleware, call controller |
| Controller | `src/controllers/` | Parse request, call service, send response |
| Service | `src/services/` | All business logic |
| Query | `src/db/queries/` | Kysely database queries only |

## Project Structure

```
src/
  index.ts              Express entry point
  routes/               Route definitions (user, goals, food, search, favorites, ai)
  controllers/          Request/response handlers
  services/             Business logic
    search.service.ts   Open Food Facts search + custom food merge + relevance scoring
    food.service.ts     Food logging, daily/weekly queries, edit/delete
    goals.service.ts    Macro target calculation and custom override
    user.service.ts     User sync and profile management
    favorites.service.ts  Favorites CRUD
    ai.service.ts       OpenAI GPT-4o meal suggestions
  db/
    connection.ts       MySQL2 pool + Kysely instance
    types.ts            Kysely Database interface
    queries/            Typed query files (user, goals, food, customFoods, favorites)
  middleware/
    requireAuth.ts      Clerk JWT verification + lazy user sync
    validateBody.ts     Zod schema validation
    errorHandler.ts     Global error handler
  lib/
    tdee.ts             BMR, TDEE, and macro target calculations

migrations/             SQL migration files (001–006)
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/user/profile` | Yes | Get user profile |
| PUT | `/api/user/profile` | Yes | Update user profile |
| GET | `/api/goals` | Yes | Get macro targets |
| PUT | `/api/goals` | Yes | Update macro targets (custom) |
| POST | `/api/goals/reset` | Yes | Reset to calculated targets |
| POST | `/api/food/log` | Yes | Log a food entry |
| GET | `/api/food/log/today?date=YYYY-MM-DD` | Yes | Get daily food log |
| GET | `/api/food/log/week` | Yes | Get weekly food log |
| PUT | `/api/food/log/:id` | Yes | Update a food entry |
| DELETE | `/api/food/log/:id` | Yes | Delete a food entry |
| GET | `/api/food/recent` | Yes | Get recently logged foods |
| GET | `/api/search/food?q=query` | Yes | Search foods |
| GET | `/api/search/barcode/:code` | Yes | Barcode lookup |
| POST | `/api/search/custom` | Yes | Create custom food |
| GET | `/api/favorites` | Yes | Get user favorites |
| POST | `/api/favorites` | Yes | Add a favorite |
| DELETE | `/api/favorites/:id` | Yes | Remove a favorite |
| POST | `/api/ai/suggest` | Yes | Get AI meal suggestions |

## Food Search

Food search uses the [Open Food Facts Elasticsearch API](https://search.openfoodfacts.org) filtered to Sweden. Results are:

1. Fetched in parallel with user's custom foods
2. Deduplicated (custom foods take priority)
3. Filtered by relevance score (diacritic-normalized matching)
4. Sorted by relevance (exact match > starts-with > word boundary > contains)
5. Limited to 20 results

## Database Migrations

Run migrations in order against your MySQL database:

```bash
mysql -u root fuelsync < migrations/001_create_users.sql
mysql -u root fuelsync < migrations/002_create_macro_targets.sql
mysql -u root fuelsync < migrations/003_create_food_entries.sql
mysql -u root fuelsync < migrations/004_create_custom_foods.sql
mysql -u root fuelsync < migrations/005_create_user_favorites.sql
mysql -u root fuelsync < migrations/006_add_default_serving_to_custom_foods.sql
```

## Environment Variables

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

## Development

```bash
npm install
npm run dev    # starts ts-node-dev with auto-restart
```

The server runs on `http://localhost:3001` by default.
