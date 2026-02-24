# FuelSync — System Architecture Document

> **Purpose:** This document is the single source of truth for building the FuelSync application.
> It covers the full stack: frontend, backend, database, external integrations, and conventions.
> Claude Code should follow this document exactly when generating files, routes, schemas, and logic.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Schema](#6-database-schema)
7. [Authentication — Clerk](#7-authentication--clerk)
8. [External Integrations](#8-external-integrations)
9. [AI Integration — OpenAI](#9-ai-integration--openai)
10. [TDEE & Macro Calculation Logic](#10-tdee--macro-calculation-logic)
11. [API Contract](#11-api-contract)
12. [Environment Variables](#12-environment-variables)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [Conventions & Rules](#14-conventions--rules)
15. [Build Order](#15-build-order)

---

## 1. Project Overview

**FuelSync** is a personal nutrition and fitness tracking web application. It is inspired by Lifesum but fully customizable — users can override every macro target and set their own dietary preferences.

### Core Goals

- Users select one of three **goal modes**: `cut`, `bulk`, or `maintain`
- The app calculates personalized daily macro targets (calories, protein, carbs, fat) using TDEE
- Users can **override any macro target** manually at any time
- Users can log food via search or barcode scan
- An AI assistant suggests meals based on remaining daily macros
- The app is built to be **extended** in the future with diet type filtering (vegan, vegetarian, pescetarian, keto, etc.)

### Goal Mode Definitions

| Mode | Intent | Caloric Adjustment |
|------|--------|--------------------|
| `cut` | Lose fat, preserve muscle | TDEE − 400 kcal deficit |
| `bulk` | Gain muscle, accept minimal fat gain | TDEE + 300 kcal surplus |
| `maintain` | Hold current weight, body recomp focus | TDEE exactly |

---

## 2. Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework and build tool |
| TypeScript (strict) | Type safety, no `any` allowed |
| Tailwind CSS v3 | Styling |
| TanStack Query v5 | Server state, caching, loading/error handling |
| Zustand | Lightweight global client state (auth session, active goal) |
| react-hook-form + zod | All forms and input validation |
| Recharts | Progress charts (macro rings, weekly trend lines) |
| html5-qrcode | In-browser barcode scanning via camera |
| Clerk React SDK | Authentication UI and session management |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js 20+ | Runtime |
| Express 4 | HTTP framework |
| TypeScript (strict) | Type safety throughout |
| mysql2 | MySQL driver with promise support |
| Kysely | Type-safe SQL query builder (no ORM) |
| Clerk Express SDK | JWT session verification middleware |
| OpenAI Node SDK | AI meal suggestion integration |
| zod | Request body validation on all routes |
| dotenv | Environment variable loading |

### Database
| Tool | Purpose |
|------|---------|
| MySQL 8+ | Primary relational database |

### External APIs
| API | Purpose |
|-----|---------|
| Open Food Facts | Food search and nutritional data (free, no key) |
| OpenAI GPT-4o | AI meal suggestions based on remaining macros |
| Clerk | Authentication, user session, user metadata |

---

## 3. Repository Structure

```
fuelsync/
├── client/                          # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable base components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── food/
│   │   │   │   ├── FoodSearchBar.tsx
│   │   │   │   ├── FoodCard.tsx
│   │   │   │   ├── FoodLogItem.tsx
│   │   │   │   └── BarcodeScanner.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── MacroRing.tsx    # Circular progress for protein/carbs/fat
│   │   │   │   ├── CalorieBar.tsx   # Horizontal calorie progress bar
│   │   │   │   ├── MealSection.tsx  # Breakfast/Lunch/Dinner/Snack group
│   │   │   │   └── WeeklyChart.tsx  # Recharts weekly macro trend
│   │   │   ├── goals/
│   │   │   │   ├── GoalModeCard.tsx  # Cut / Bulk / Maintain selector card
│   │   │   │   └── MacroEditor.tsx   # Override individual macro targets
│   │   │   └── ai/
│   │   │       └── AISuggestionPanel.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Main daily log view
│   │   │   ├── FoodLog.tsx          # Search + log food
│   │   │   ├── Goals.tsx            # Goal mode + macro override
│   │   │   ├── Progress.tsx         # Charts and historical data
│   │   │   ├── Profile.tsx          # User profile, body stats
│   │   │   └── auth/
│   │   │       ├── SignIn.tsx
│   │   │       └── SignUp.tsx
│   │   ├── hooks/
│   │   │   ├── useFoodSearch.ts     # Calls /api/food/search (proxies Open Food Facts)
│   │   │   ├── useDailyLog.ts       # Fetches today's food entries
│   │   │   ├── useMacroTargets.ts   # Fetches user's current macro goals
│   │   │   ├── useWeeklyProgress.ts # Fetches last 7 days of log data
│   │   │   └── useAISuggestion.ts   # Calls /api/ai/suggest
│   │   ├── lib/
│   │   │   ├── api.ts               # Base fetch wrapper with auth headers
│   │   │   ├── tdee.ts              # TDEE/BMR calculation (mirrored from server)
│   │   │   └── validators.ts        # Shared zod schemas
│   │   ├── store/
│   │   │   └── authStore.ts         # Zustand: user session + active goal mode
│   │   ├── types/
│   │   │   └── index.ts             # All shared TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx               # React Router v6 route definitions
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── food.ts              # POST /log, GET /log/today, GET /log/week
│   │   │   ├── goals.ts             # GET /goals, PUT /goals
│   │   │   ├── user.ts              # GET /user/profile, PUT /user/profile
│   │   │   ├── search.ts            # GET /food/search, GET /food/barcode/:code
│   │   │   └── ai.ts                # POST /ai/suggest
│   │   ├── controllers/
│   │   │   ├── food.controller.ts
│   │   │   ├── goals.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── search.controller.ts
│   │   │   └── ai.controller.ts
│   │   ├── services/
│   │   │   ├── food.service.ts      # Business logic for food logging
│   │   │   ├── goals.service.ts     # TDEE calculation + macro target logic
│   │   │   ├── user.service.ts      # User sync + profile update logic
│   │   │   ├── search.service.ts    # Open Food Facts proxy logic
│   │   │   └── ai.service.ts        # OpenAI prompt construction + call
│   │   ├── db/
│   │   │   ├── connection.ts        # mysql2 pool + Kysely instance
│   │   │   ├── types.ts             # Kysely database interface (mirrors schema)
│   │   │   └── queries/
│   │   │       ├── food.queries.ts
│   │   │       ├── goals.queries.ts
│   │   │       └── user.queries.ts
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts       # Clerk JWT verification middleware
│   │   │   ├── validateBody.ts      # Zod request body validation middleware
│   │   │   └── errorHandler.ts      # Global Express error handler
│   │   ├── lib/
│   │   │   └── tdee.ts              # TDEE/BMR calculation logic
│   │   ├── types/
│   │   │   └── index.ts             # Shared server-side types
│   │   └── index.ts                 # Express app entry point
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_macro_targets.sql
│   │   ├── 003_create_food_entries.sql
│   │   └── 004_create_custom_foods.sql
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Frontend Architecture

### Routing (React Router v6)

```
/                    → redirect to /dashboard if authenticated, else /sign-in
/sign-in             → Clerk SignIn component
/sign-up             → Clerk SignUp component
/dashboard           → Dashboard.tsx (protected)
/food                → FoodLog.tsx (protected)
/goals               → Goals.tsx (protected)
/progress            → Progress.tsx (protected)
/profile             → Profile.tsx (protected)
```

All routes under `/dashboard`, `/food`, `/goals`, `/progress`, `/profile` are wrapped in a `<ProtectedRoute>` component that uses Clerk's `useAuth()` to redirect unauthenticated users to `/sign-in`.

### Global State (Zustand — `authStore.ts`)

```typescript
type AuthStore = {
  userId: string | null;
  goalMode: 'cut' | 'bulk' | 'maintain' | null;
  setUserId: (id: string) => void;
  setGoalMode: (mode: 'cut' | 'bulk' | 'maintain') => void;
  clear: () => void;
};
```

This store holds only what is needed globally client-side. All server data (food logs, macro targets) lives in TanStack Query cache.

### API Layer (`lib/api.ts`)

All API calls go through a single base fetch wrapper that automatically injects the Clerk session token:

```typescript
// lib/api.ts
import { useAuth } from '@clerk/clerk-react';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getClerkToken(); // getToken() from useAuth()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

Note: `apiFetch` is a utility that must be called from within React hooks (where `useAuth` is available). Create a custom hook `useApiFetch` that wraps it with token injection.

### TanStack Query — Key Query Keys

```typescript
// Consistent query keys for cache management
export const queryKeys = {
  dailyLog: (date: string) => ['food-log', date],
  weeklyLog: () => ['food-log', 'week'],
  macroTargets: () => ['macro-targets'],
  userProfile: () => ['user-profile'],
  foodSearch: (query: string) => ['food-search', query],
};
```

### TypeScript Types (`types/index.ts`)

```typescript
export type GoalMode = 'cut' | 'bulk' | 'maintain';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type DietType =
  | 'standard'
  | 'vegetarian'
  | 'vegan'
  | 'pescetarian'
  | 'keto'
  | 'paleo';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type UserProfile = {
  id: string; // Clerk userId
  email: string;
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goalType: GoalMode;
  dietType: DietType;
  sex: 'male' | 'female';
  createdAt: string;
};

export type MacroTargets = {
  id: number;
  userId: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCustom: boolean; // false = TDEE-calculated, true = user-overridden
  updatedAt: string;
};

export type FoodEntry = {
  id: number;
  userId: string;
  foodName: string;
  barcode: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number;
  mealType: MealType;
  loggedAt: string; // ISO UTC timestamp
};

export type FoodSearchResult = {
  name: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  imageUrl: string | null;
  source: 'open_food_facts' | 'custom';
};

export type DailyMacroSummary = {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  entries: FoodEntry[];
};

export type AISuggestion = {
  suggestions: {
    name: string;
    description: string;
    estimatedCalories: number;
    estimatedProteinG: number;
    estimatedCarbsG: number;
    estimatedFatG: number;
  }[];
};
```

---

## 5. Backend Architecture

### Express App Entry (`src/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { errorHandler } from './middleware/errorHandler';
import foodRoutes from './routes/food';
import goalsRoutes from './routes/goals';
import userRoutes from './routes/user';
import searchRoutes from './routes/search';
import aiRoutes from './routes/ai';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(clerkMiddleware()); // Attaches auth to req, does NOT enforce it

app.use('/api/food', foodRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

app.listen(process.env.PORT || 3001);
```

### Auth Middleware (`middleware/requireAuth.ts`)

```typescript
import { requireAuth as clerkRequireAuth } from '@clerk/express';

// Wrap Clerk's requireAuth and additionally trigger user sync
export const requireAuth = [
  clerkRequireAuth(),
  syncUserMiddleware, // see User Sync section below
];
```

Every protected route uses this `requireAuth` middleware array. It verifies the Clerk JWT and syncs the user to MySQL if they don't exist yet.

### User Sync Pattern (`services/user.service.ts`)

On every authenticated request, check if the Clerk `userId` exists in the `users` table. If not, create the row. This is a **lazy sync** — no webhook required.

```typescript
export async function syncUser(clerkUserId: string, email: string): Promise<void> {
  const existing = await userQueries.findById(clerkUserId);
  if (!existing) {
    await userQueries.create({ id: clerkUserId, email });
  }
}
```

The `syncUserMiddleware` calls this on every request after Clerk verifies the token.

### Request Validation (`middleware/validateBody.ts`)

All POST/PUT routes use zod schemas to validate request bodies before reaching controllers:

```typescript
import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
```

### Error Handler (`middleware/errorHandler.ts`)

```typescript
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
};
```

---

## 6. Database Schema

### Migration: 001 — users

```sql
CREATE TABLE users (
  id             VARCHAR(255) PRIMARY KEY,           -- Clerk userId e.g. "user_2abc..."
  email          VARCHAR(255) NOT NULL UNIQUE,
  name           VARCHAR(255),
  age            INT,
  weight_kg      DECIMAL(5,2),
  height_cm      INT,
  sex            ENUM('male', 'female'),
  activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
  goal_type      ENUM('cut', 'bulk', 'maintain')    DEFAULT 'maintain',
  diet_type      VARCHAR(50)                         DEFAULT 'standard',
  -- diet_type stored as VARCHAR for forward compatibility when more types are added.
  -- Valid values: 'standard', 'vegetarian', 'vegan', 'pescetarian', 'keto', 'paleo'
  created_at     TIMESTAMP                           DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP                           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Migration: 002 — macro_targets

```sql
CREATE TABLE macro_targets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(255) NOT NULL,
  calories    INT          NOT NULL,
  protein_g   INT          NOT NULL,
  carbs_g     INT          NOT NULL,
  fat_g       INT          NOT NULL,
  is_custom   BOOLEAN      NOT NULL DEFAULT FALSE,
  -- is_custom = FALSE: values are TDEE-calculated (recalculated when profile changes)
  -- is_custom = TRUE:  values are user-overridden (never auto-overwritten)
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id)              -- one row per user
);
```

### Migration: 003 — food_entries

```sql
CREATE TABLE food_entries (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(255) NOT NULL,
  food_name   VARCHAR(255) NOT NULL,
  barcode     VARCHAR(100),
  calories    INT          NOT NULL,
  protein_g   DECIMAL(6,2) NOT NULL,
  carbs_g     DECIMAL(6,2) NOT NULL,
  fat_g       DECIMAL(6,2) NOT NULL,
  serving_g   DECIMAL(6,2) NOT NULL DEFAULT 100,
  meal_type   ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  logged_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- logged_at is stored in UTC. Client converts to local date for "today" queries.
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, logged_at)
);
```

### Migration: 004 — custom_foods

```sql
CREATE TABLE custom_foods (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             VARCHAR(255) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  calories_per_100g   INT          NOT NULL,
  protein_per_100g    DECIMAL(6,2) NOT NULL,
  carbs_per_100g      DECIMAL(6,2) NOT NULL,
  fat_per_100g        DECIMAL(6,2) NOT NULL,
  created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Kysely Database Interface (`db/types.ts`)

```typescript
import { Generated, ColumnType } from 'kysely';

export type Database = {
  users: UsersTable;
  macro_targets: MacroTargetsTable;
  food_entries: FoodEntriesTable;
  custom_foods: CustomFoodsTable;
};

type UsersTable = {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  sex: 'male' | 'female' | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  goal_type: 'cut' | 'bulk' | 'maintain';
  diet_type: string;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
};

type MacroTargetsTable = {
  id: Generated<number>;
  user_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_custom: boolean;
  updated_at: ColumnType<Date, never, never>;
};

type FoodEntriesTable = {
  id: Generated<number>;
  user_id: string;
  food_name: string;
  barcode: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_g: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: ColumnType<Date, Date, never>;
};

type CustomFoodsTable = {
  id: Generated<number>;
  user_id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  created_at: ColumnType<Date, never, never>;
};
```

---

## 7. Authentication — Clerk

### Setup

Frontend: Install `@clerk/clerk-react`. Wrap `<App />` with `<ClerkProvider publishableKey={...}>`.

Backend: Install `@clerk/express`. Call `clerkMiddleware()` globally in Express. Protect individual routes with `requireAuth()` from `@clerk/express`.

### Frontend Clerk Usage

```typescript
// Access user in any component
import { useUser, useAuth } from '@clerk/clerk-react';

const { user } = useUser();          // user.id = Clerk userId
const { getToken } = useAuth();      // used in api.ts to inject Bearer token
```

### Protected Routes in React

```typescript
// router.tsx
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <Spinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" />;
  return <>{children}</>;
};
```

### Backend — Accessing the User ID in Controllers

After `requireAuth()` middleware, access the Clerk userId via:

```typescript
import { getAuth } from '@clerk/express';

const { userId } = getAuth(req); // string e.g. "user_2abc..."
```

This `userId` is the primary key in your `users` table and is used as the foreign key in all other tables.

---

## 8. External Integrations

### Open Food Facts (Food Search)

**Important:** All calls to Open Food Facts are made **server-side** via a proxy route. This avoids CORS issues, keeps your backend as the single point of control, and lets you add caching later without frontend changes.

**Search Endpoint:**
```
GET https://world.openfoodfacts.org/cgi/search.pl
  ?search_terms={query}
  &search_simple=1
  &action=process
  &json=1
  &fields=product_name,code,nutriments,image_url
  &page_size=10
```

**Barcode Lookup:**
```
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```

**Normalisation function** — always map Open Food Facts response to your internal `FoodSearchResult` type in `search.service.ts` before returning to the client. Fields like `nutriments['energy-kcal_100g']` must be mapped to `caloriesPer100g`.

```typescript
function normalizeOpenFoodFacts(product: any): FoodSearchResult {
  return {
    name: product.product_name ?? 'Unknown',
    barcode: product.code ?? null,
    caloriesPer100g: product.nutriments?.['energy-kcal_100g'] ?? 0,
    proteinPer100g: product.nutriments?.proteins_100g ?? 0,
    carbsPer100g: product.nutriments?.carbohydrates_100g ?? 0,
    fatPer100g: product.nutriments?.fat_100g ?? 0,
    imageUrl: product.image_url ?? null,
    source: 'open_food_facts',
  };
}
```

**Missing data handling:** Many Open Food Facts entries have incomplete nutritional data. If `caloriesPer100g` is 0 or null after normalisation, the result should be filtered out and not returned to the client.

### Barcode Scanner (Frontend)

Use `html5-qrcode` library in the `BarcodeScanner.tsx` component. On a successful scan, call the `/api/search/barcode/:code` backend route. Display a camera preview inside a modal.

---

## 9. AI Integration — OpenAI

### Route: `POST /api/ai/suggest`

**Never call OpenAI from the frontend.** The API key is server-side only.

**Request body:**

```typescript
type AISuggestRequest = {
  remainingCalories: number;
  remainingProteinG: number;
  remainingCarbsG: number;
  remainingFatG: number;
  goalMode: 'cut' | 'bulk' | 'maintain';
  dietType: string; // 'standard', 'vegetarian', 'vegan', etc.
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};
```

**Prompt Construction (`ai.service.ts`):**

```typescript
function buildPrompt(params: AISuggestRequest): string {
  const dietNote = params.dietType !== 'standard'
    ? `The user follows a ${params.dietType} diet — only suggest foods that comply strictly.`
    : '';

  return `
You are a nutrition assistant helping a user reach their daily macro goals.

Goal mode: ${params.goalMode}
Diet: ${params.dietType}
${dietNote}

Remaining macros for today:
- Calories: ${params.remainingCalories} kcal
- Protein: ${params.remainingProteinG}g
- Carbs: ${params.remainingCarbsG}g
- Fat: ${params.remainingFatG}g

Suggest exactly 3 ${params.mealType} options that fit within these remaining macros.
For each suggestion, provide:
- A short meal name
- A 1-2 sentence description
- Estimated macros (calories, protein_g, carbs_g, fat_g)

Respond ONLY with a valid JSON array. No explanation, no markdown.
Format:
[
  {
    "name": "...",
    "description": "...",
    "estimatedCalories": 0,
    "estimatedProteinG": 0,
    "estimatedCarbsG": 0,
    "estimatedFatG": 0
  }
]
  `.trim();
}
```

**OpenAI call:**

```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: buildPrompt(params) }],
  temperature: 0.7,
  max_tokens: 600,
});

const raw = completion.choices[0].message.content ?? '[]';
const suggestions = JSON.parse(raw); // always try/catch this
```

**Always wrap `JSON.parse` in try/catch.** If parsing fails, return a 502 error to the client — do not surface raw OpenAI output.

---

## 10. TDEE & Macro Calculation Logic

This logic lives in `server/src/lib/tdee.ts` and is the authoritative calculation source. A mirrored version in `client/src/lib/tdee.ts` is used only for real-time UI preview during profile setup.

### BMR — Mifflin-St Jeor Formula

```typescript
function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
}): number {
  const base = 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age;
  return params.sex === 'male' ? base + 5 : base - 161;
}
```

### TDEE — Activity Multiplier

```typescript
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:   1.2,   // little or no exercise
  light:       1.375, // light exercise 1-3 days/week
  moderate:    1.55,  // moderate exercise 3-5 days/week
  active:      1.725, // hard exercise 6-7 days/week
  very_active: 1.9,   // very hard exercise + physical job
};

function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}
```

### Goal Adjustment

```typescript
const GOAL_CALORIE_ADJUSTMENTS: Record<GoalMode, number> = {
  cut:      -400,
  bulk:     +300,
  maintain:  0,
};

function applyGoalAdjustment(tdee: number, goal: GoalMode): number {
  return tdee + GOAL_CALORIE_ADJUSTMENTS[goal];
}
```

### Macro Split from Target Calories

```typescript
function calculateMacros(targetCalories: number, goal: GoalMode): {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
} {
  // Macro splits by goal (% of total calories):
  // cut:      30% protein, 40% carbs, 30% fat
  // bulk:     25% protein, 50% carbs, 25% fat
  // maintain: 25% protein, 45% carbs, 30% fat
  const splits = {
    cut:      { protein: 0.30, carbs: 0.40, fat: 0.30 },
    bulk:     { protein: 0.25, carbs: 0.50, fat: 0.25 },
    maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 },
  };
  const s = splits[goal];
  return {
    calories:  targetCalories,
    proteinG:  Math.round((targetCalories * s.protein) / 4), // 4 kcal/g
    carbsG:    Math.round((targetCalories * s.carbs)   / 4), // 4 kcal/g
    fatG:      Math.round((targetCalories * s.fat)     / 9), // 9 kcal/g
  };
}
```

### Full Pipeline

```typescript
export function computeMacroTargets(profile: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: ActivityLevel;
  goalType: GoalMode;
}): MacroTargets {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetCalories = applyGoalAdjustment(tdee, profile.goalType);
  return calculateMacros(targetCalories, profile.goalType);
}
```

### When to Recalculate

`macro_targets` is recalculated and **overwritten only when `is_custom = false`** (i.e., the user has not manually overridden their targets). This recalculation is triggered when the user:
- Updates weight, height, age, sex, activity level, or goal type in their profile
- It is **not** triggered automatically on every login

If `is_custom = true`, profile updates do **not** overwrite macro targets. The user must explicitly click "Reset to calculated" in the Goals page to switch back to auto-calculated targets.

---

## 11. API Contract

All routes require `Authorization: Bearer <clerk_session_token>` unless marked as public.

### User

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/user/profile` | — | `UserProfile` |
| PUT | `/api/user/profile` | `Partial<UserProfile>` | `UserProfile` |

**PUT `/api/user/profile`** triggers macro recalculation if `is_custom = false` and body contains any TDEE-affecting field.

### Goals

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/goals` | — | `MacroTargets` |
| PUT | `/api/goals` | `{ calories, proteinG, carbsG, fatG }` | `MacroTargets` |
| POST | `/api/goals/reset` | — | `MacroTargets` |

**PUT `/api/goals`** sets `is_custom = true`.
**POST `/api/goals/reset`** recalculates from profile and sets `is_custom = false`.

### Food Log

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/food/log/today` | — | `DailyMacroSummary` |
| GET | `/api/food/log/week` | — | `DailyMacroSummary[]` (7 items) |
| POST | `/api/food/log` | `FoodEntryInput` | `FoodEntry` |
| DELETE | `/api/food/log/:id` | — | `{ success: true }` |

**FoodEntryInput:**
```typescript
type FoodEntryInput = {
  foodName: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingG: number;     // the controller calculates actual macros from per-100g * serving
  mealType: MealType;
};
```

The controller converts `per100g * servingG / 100` to get actual values stored in `food_entries`.

### Search

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/search/food?q={query}` | — | `FoodSearchResult[]` |
| GET | `/api/search/barcode/:code` | — | `FoodSearchResult` |

### AI

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/ai/suggest` | `AISuggestRequest` | `AISuggestion` |

---

## 12. Environment Variables

### `server/.env`

```env
# Server
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fuelsync

# Clerk
CLERK_SECRET_KEY=sk_test_...

# OpenAI
OPENAI_API_KEY=sk-...
```

### `client/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3001
```

---

## 13. Data Flow Diagrams

### User Logs a Food Item

```
User searches "chicken breast"
  → Frontend: FoodSearchBar calls useFoodSearch("chicken breast")
  → GET /api/search/food?q=chicken+breast
  → Server: search.service.ts → Open Food Facts API
  → Returns FoodSearchResult[]
  → User selects item, enters serving size (e.g. 150g)
  → POST /api/food/log { foodName, caloriesPer100g, servingG: 150, mealType: "lunch", ... }
  → Server: calculates actual macros (caloriesPer100g * 150 / 100)
  → Inserts into food_entries
  → Returns FoodEntry
  → TanStack Query invalidates ['food-log', today] cache
  → Dashboard re-renders with updated macro progress
```

### Profile Update Triggers Macro Recalculation

```
User updates weight from 80kg to 77kg
  → PUT /api/user/profile { weightKg: 77 }
  → user.service: updates users table
  → user.service: checks macro_targets.is_custom for this user
  → if is_custom = false:
      → computeMacroTargets(updatedProfile)
      → UPDATE macro_targets SET calories=..., protein_g=..., ... WHERE user_id=...
  → if is_custom = true:
      → skip macro recalculation, leave macro_targets unchanged
  → Returns updated UserProfile
```

### AI Meal Suggestion

```
User clicks "Suggest a meal"
  → Frontend: fetches today's log to calculate remaining macros
  → remainingCalories = targets.calories - consumed.calories (etc.)
  → POST /api/ai/suggest { remainingCalories, remainingProteinG, ..., goalMode, dietType, mealType }
  → ai.service: builds prompt with user context
  → Calls OpenAI GPT-4o
  → Parses JSON response
  → Returns AISuggestion to client
  → AISuggestionPanel renders 3 meal cards
```

---

## 14. Conventions & Rules

### TypeScript

- `strict: true` in all `tsconfig.json` files — no exceptions
- No `any` type anywhere in the codebase
- All API response types must be explicitly typed, not inferred from fetch calls
- Use `type` over `interface` unless interface merging is required
- Generic utilities and hooks must use generics (e.g., `apiFetch<T>`)

### React

- Functional components only, RAFCE style
- `useState` for simple isolated state
- `useReducer` for multi-field related state (e.g., the food logging form state)
- `useContext` only if absolutely needed for deeply shared state — prefer Zustand
- Custom hooks for any logic used in more than one component
- `useEffect` must only have primitive dependencies unless values are memoized
- No inline `fetch` calls — always go through `apiFetch` in `lib/api.ts`

### Backend

- Controllers handle request/response only — no business logic
- Services handle all business logic — no Express `req/res` objects
- Query files contain only SQL/Kysely queries — no business logic
- All route handlers must be `async/await` with errors forwarded to `next(err)`
- Every POST/PUT route must have zod validation middleware applied

### Naming

- Files: `camelCase.ts` for utilities/hooks, `PascalCase.tsx` for components
- Database columns: `snake_case`
- TypeScript types: `PascalCase`
- API routes: `kebab-case` and REST-standard (nouns, not verbs)
- Environment variables: `SCREAMING_SNAKE_CASE`

### Date/Time

- All timestamps stored in MySQL as UTC
- `logged_at` on food entries is stored UTC; the client queries "today" using UTC date boundaries
- The server route `GET /api/food/log/today` accepts an optional `?date=YYYY-MM-DD` query param in the user's local date; the server converts to UTC range for the query

### Error Responses

All error responses use this shape:
```json
{ "error": "Human-readable error message" }
```

Validation errors use:
```json
{ "errors": { "fieldErrors": { "calories": ["Required"] } } }
```

---

## 15. Build Order

Build in this exact sequence. Do not skip ahead — each phase depends on the previous.

**Phase 1 — Foundation**
1. Initialize both `client/` (Vite + React + TS + Tailwind) and `server/` (Express + TS) projects
2. Set up Clerk in both client and server
3. Implement `requireAuth` middleware + lazy user sync
4. Implement base `apiFetch` wrapper on the client
5. Run migrations 001–004 to create the database schema

**Phase 2 — Profile & Goals**
6. Build `PUT /api/user/profile` and `GET /api/user/profile`
7. Build the Profile page (age, weight, height, sex, activity level, goal type, diet type)
8. Implement `computeMacroTargets` in `lib/tdee.ts`
9. Build `GET /api/goals`, `PUT /api/goals`, `POST /api/goals/reset`
10. Build the Goals page with goal mode selector cards and macro override inputs

**Phase 3 — Food Logging Core**
11. Build `GET /api/search/food` proxying Open Food Facts
12. Build `POST /api/food/log` and `GET /api/food/log/today`
13. Build the FoodLog page: search bar, food cards, serving size input, meal type selector
14. Build the Dashboard page: calorie bar, macro rings, meal sections with logged items
15. Build `DELETE /api/food/log/:id`

**Phase 4 — History & Progress**
16. Build `GET /api/food/log/week`
17. Build the Progress page with Recharts weekly trend charts

**Phase 5 — Barcode Scanning**
18. Implement `BarcodeScanner.tsx` with `html5-qrcode`
19. Build `GET /api/search/barcode/:code`
20. Wire scanner into FoodLog page

**Phase 6 — AI Suggestions**
21. Build `POST /api/ai/suggest` with OpenAI integration
22. Build `AISuggestionPanel.tsx` on the Dashboard

---

*End of Architecture Document — FuelSync v1.0*
