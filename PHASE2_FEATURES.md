# FuelSync — Phase 2 Feature Architecture

> **Purpose:** This document defines the architecture for all Phase 2 features.
> It is a continuation of `ARCHITECTURE.md` and `CLAUDE.md` — both must be read before this document.
> Claude Code must follow all conventions established in those files.
> Build features in the exact order listed in the Build Order section at the bottom.

---

## Table of Contents

1. [New Database Migrations](#1-new-database-migrations)
2. [Meal Calorie Recommendations](#2-meal-calorie-recommendations)
3. [Edit Logged Food Item](#3-edit-logged-food-item)
4. [Macro Tooltip](#4-macro-tooltip)
5. [Recently Added & Quick Tabs](#5-recently-added--quick-tabs)
6. [Favorites](#6-favorites)
7. [Manual Food Entry](#7-manual-food-entry)
8. [Portion Size Improvements](#8-portion-size-improvements)
9. [New API Endpoints](#9-new-api-endpoints)
10. [New File Structure](#10-new-file-structure)
11. [Build Order](#11-build-order)

---

## 1. New Database Migrations

Run these migrations before implementing any feature. They must be created as files in `server/migrations/`.

### Migration: 005_create_user_favorites.sql

```sql
CREATE TABLE user_favorites (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            VARCHAR(255) NOT NULL,
  food_name          VARCHAR(255) NOT NULL,
  barcode            VARCHAR(100),
  calories_per_100g  INT          NOT NULL,
  protein_per_100g   DECIMAL(6,2) NOT NULL,
  carbs_per_100g     DECIMAL(6,2) NOT NULL,
  fat_per_100g       DECIMAL(6,2) NOT NULL,
  default_serving_g  DECIMAL(6,2),
  source             VARCHAR(50)  NOT NULL DEFAULT 'open_food_facts',
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_food (user_id, food_name)
);
```

### Migration: 006_add_put_food_log.sql

No schema change needed for editing — `food_entries` already supports updates. This migration is a placeholder reminder that `PUT /api/food/log/:id` must be added.

```sql
-- No schema changes required.
-- PUT /api/food/log/:id updates serving_g, meal_type, and recalculates
-- calories, protein_g, carbs_g, fat_g server-side.
SELECT 1;
```

### Update Kysely Database Interface

Add `user_favorites` to `server/src/db/types.ts`:

```typescript
type UserFavoritesTable = {
  id: Generated<number>;
  user_id: string;
  food_name: string;
  barcode: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  default_serving_g: number | null;
  source: string;
  created_at: ColumnType<Date, never, never>;
};
```

Add to `Database` type:
```typescript
export type Database = {
  users: UsersTable;
  macro_targets: MacroTargetsTable;
  food_entries: FoodEntriesTable;
  custom_foods: CustomFoodsTable;
  user_favorites: UserFavoritesTable; // NEW
};
```

---

## 2. Meal Calorie Recommendations

### Overview

Each meal section on the Dashboard shows a recommended calorie range based on the user's daily calorie target. This is pure frontend logic — no backend changes required.

### Calculation Logic

Create `client/src/lib/mealRecommendations.ts`:

```typescript
import { MealType } from '../types';

const MEAL_SHARES: Record<MealType, number> = {
  breakfast: 0.25,
  lunch:     0.30,
  dinner:    0.35,
  snack:     0.10,
};

export type MealCalorieRange = {
  min: number;
  max: number;
};

export function getMealCalorieRange(
  targetCalories: number,
  meal: MealType
): MealCalorieRange {
  const base = targetCalories * MEAL_SHARES[meal];
  return {
    min: Math.round(base * 0.9),
    max: Math.round(base * 1.1),
  };
}
```

### Usage in MealSection

`MealSection.tsx` already receives `mealType` as a prop. Add `targetCalories: number` as an additional prop. When the meal has no logged entries, display:

```
Rekommenderad: {min}–{max} kcal
```

When the meal has entries, replace this text with the total calories logged for that meal:

```
{totalKcal} kcal loggade
```

### Display Rule

- Empty meal: show recommended range in muted grey text
- Meal with entries: show logged kcal in normal text
- Never show both at the same time

---

## 3. Edit Logged Food Item

### Overview

Each logged food item in the Dashboard has an edit button (pencil icon). Clicking it opens a modal where the user can change the serving size and meal type. The server recalculates macros from the new serving size.

### New Backend Route

`PUT /api/food/log/:id`

**Files to create/update:**
- `server/src/routes/food.ts` — add PUT route
- `server/src/controllers/food.controller.ts` — add `updateFoodEntry` controller
- `server/src/services/food.service.ts` — add `updateFoodEntry` service
- `server/src/db/queries/food.queries.ts` — add `updateFoodEntry` query

**Zod validation schema:**
```typescript
const UpdateFoodEntrySchema = z.object({
  servingG:  z.number().positive(),
  mealType:  z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
});
```

**Service logic:**

```typescript
export async function updateFoodEntry(
  entryId: number,
  userId: string,
  input: { servingG: number; mealType?: MealType }
): Promise<FoodEntry> {
  // 1. Fetch the existing entry to get per-100g values
  const existing = await foodQueries.findById(entryId, userId);
  if (!existing) throw new Error('Food entry not found');

  // 2. Recalculate macros from new serving size
  // The entry stores actual values, so we need to reverse-engineer per-100g
  // Store original per-100g values in food_entries — see note below
  const factor = input.servingG / existing.serving_g;
  const updated = {
    serving_g:  input.servingG,
    calories:   Math.round(existing.calories * factor),
    protein_g:  Number((existing.protein_g * factor).toFixed(2)),
    carbs_g:    Number((existing.carbs_g * factor).toFixed(2)),
    fat_g:      Number((existing.fat_g * factor).toFixed(2)),
    meal_type:  input.mealType ?? existing.meal_type,
  };

  return foodQueries.updateEntry(entryId, userId, updated);
}
```

> **Important note on macro recalculation:** The factor approach above (`new / old serving`) works correctly for editing. It does NOT require storing per-100g values separately — the ratio stays accurate regardless of original serving size.

**Security rule:** Always include `userId` in the WHERE clause of the update query. Never update an entry by `id` alone — a user must only be able to edit their own entries.

```typescript
// In food.queries.ts
db.updateTable('food_entries')
  .set(updated)
  .where('id', '=', entryId)
  .where('user_id', '=', userId) // CRITICAL — always include this
  .execute()
```

### Frontend: EditFoodModal Component

Create `client/src/components/food/EditFoodModal.tsx`.

Props:
```typescript
type EditFoodModalProps = {
  entry: FoodEntry;
  onClose: () => void;
  onSave: () => void;
};
```

Modal contents:
- Food name as a heading (read-only)
- Number input for serving size in grams, pre-filled with current `serving_g`
- A live macro preview that recalculates as the user types the new serving size:
  ```typescript
  const factor = newServingG / entry.servingG;
  const previewCalories = Math.round(entry.calories * factor);
  // etc.
  ```
- Dropdown to change `mealType` (optional — pre-filled with current meal)
- "Spara" button — calls `PUT /api/food/log/:id`
- "Avbryt" button — closes modal without saving

On successful save:
- Close the modal
- Invalidate `queryKeys.dailyLog(date)` so Dashboard re-renders with updated values

### Pencil Icon in FoodLogItem

In `client/src/components/dashboard/FoodLogItem.tsx`, add a small pencil icon button on the right side of each logged item. On click, set the selected entry in local state and render `EditFoodModal`.

---

## 4. Macro Tooltip

### Overview

When hovering over the Protein, Kolhydrater, or Fett cards on the Dashboard, a tooltip appears showing detailed information. No external library — built from scratch.

### Tooltip Component

Create `client/src/components/ui/Tooltip.tsx`:

```typescript
type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

const Tooltip = ({ content, children }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                        bg-gray-900 text-white text-sm rounded-lg px-3 py-2
                        whitespace-nowrap shadow-lg pointer-events-none">
          {content}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2
                          border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};
```

### Tooltip Content Per Macro

Each macro card gets a tooltip with this information:

**Protein:**
```
Dagsmål: {targets.proteinG}g
Ätit: {consumed.proteinG}g
Återstående: {remaining.proteinG}g
Protein bygger och bevarar muskelmassa.
4 kcal per gram.
```

**Kolhydrater:**
```
Dagsmål: {targets.carbsG}g
Ätit: {consumed.carbsG}g
Återstående: {remaining.carbsG}g
Kolhydrater är kroppens primära energikälla.
4 kcal per gram.
```

**Fett:**
```
Dagsmål: {targets.fatG}g
Ätit: {consumed.fatG}g
Återstående: {remaining.fatG}g
Fett är viktigt för hormoner och cellhälsa.
9 kcal per gram.
```

### Usage in Dashboard

Wrap each macro card:
```tsx
<Tooltip content={<ProteinTooltipContent ... />}>
  <MacroCard label="Protein" ... />
</Tooltip>
```

---

## 5. Recently Added & Quick Tabs

### Overview

At the top of the food logging view, a segmented control with three tabs controls which list of foods is shown below the search bar. This replaces the current blank state when the user hasn't typed anything yet.

### Tab Definitions

```typescript
type QuickTab = 'recent' | 'favorites' | 'current';

const TAB_LABELS: Record<QuickTab, string> = {
  recent:    'Nyligen',
  favorites: 'Favoriter',
  current:   'Denna måltid',
};
```

Default active tab: `'recent'`

### Tab: Nyligen (Recently Added)

**New backend route:** `GET /api/food/recent`

Returns the 10 most frequently logged foods by the user in the last 30 days, deduplicated by food name:

```sql
SELECT
  food_name,
  MAX(calories)   AS calories,
  MAX(protein_g)  AS protein_g,
  MAX(carbs_g)    AS carbs_g,
  MAX(fat_g)      AS fat_g,
  MAX(serving_g)  AS serving_g,
  MAX(barcode)    AS barcode,
  COUNT(*)        AS log_count
FROM food_entries
WHERE user_id = ?
  AND logged_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY food_name
ORDER BY log_count DESC
LIMIT 10;
```

Response type:
```typescript
type RecentFood = {
  foodName: string;
  barcode: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number;
  logCount: number;
};
```

**Frontend hook:** `client/src/hooks/useRecentFoods.ts`

```typescript
export const useRecentFoods = () =>
  useQuery({
    queryKey: ['recent-foods'],
    queryFn: () => apiFetch<RecentFood[]>('/food/recent'),
    staleTime: 1000 * 60 * 5,
  });
```

### Tab: Favoriter

Fetches from `GET /api/favorites`. See Section 6 for full implementation.

### Tab: Denna måltid

Reads from the already-loaded `useDailyLog` data. Filter `entries` by the currently selected `mealType`. Display the logged items for the current meal so the user can see what's already been added. Each item shows name, serving size, and calories. No additional API call needed.

### Quick Food Card

Each food item in any of the three tabs is displayed as a compact `QuickFoodCard` component. Clicking it does NOT immediately log the food — it opens the serving size selector (same flow as search results) so the user can confirm the portion before logging.

```typescript
type QuickFoodCardProps = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number; // pre-fill the serving input with this value
  onSelect: (food: FoodSearchResult, defaultServingG: number) => void;
};
```

### Layout in FoodLog

```
[ Nyligen ] [ Favoriter ] [ Denna måltid ]   ← segmented control
─────────────────────────────────────────
  [list of foods for active tab]
─────────────────────────────────────────
🔍 Sök efter livsmedel...                    ← search bar below
  [search results appear here when typing]
```

When the user starts typing in the search bar, the tab list collapses/fades and search results take over. When the search field is cleared, the tabs reappear.

---

## 6. Favorites

### New Backend Routes

All routes require `requireAuth` middleware.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/favorites` | Get all favorites for the user |
| POST | `/api/favorites` | Add a food to favorites |
| DELETE | `/api/favorites/:id` | Remove a food from favorites |

**Files to create:**
- `server/src/routes/favorites.ts`
- `server/src/controllers/favorites.controller.ts`
- `server/src/services/favorites.service.ts`
- `server/src/db/queries/favorites.queries.ts`

**POST /api/favorites request body:**
```typescript
type AddFavoriteInput = {
  foodName: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingG?: number;
  source: 'livsmedelsverket' | 'open_food_facts' | 'custom';
};
```

Zod schema — validate all fields, make `barcode` and `defaultServingG` optional.

**Duplicate handling:** The `user_favorites` table has a `UNIQUE KEY` on `(user_id, food_name)`. If the user tries to add a duplicate, return HTTP 409 with `{ error: 'Already in favorites' }` — do not throw a 500.

**GET /api/favorites response:**
```typescript
type FavoriteFood = {
  id: number;
  foodName: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingG: number | null;
  source: string;
};
```

### Frontend

**Hook:** `client/src/hooks/useFavorites.ts`

```typescript
export const useFavorites = () =>
  useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiFetch<FavoriteFood[]>('/favorites'),
    staleTime: 1000 * 60 * 10,
  });
```

**Heart icon on FoodCard:**

Each `FoodCard` in search results and QuickFoodCards gets a heart icon button in the top-right corner.

Logic:
```typescript
const { data: favorites } = useFavorites();
const isFavorite = favorites?.some(f => f.foodName === food.name) ?? false;
```

- Filled heart (`♥`) = already a favorite
- Outline heart (`♡`) = not a favorite
- Clicking filled heart → `DELETE /api/favorites/:id`, invalidate `['favorites']`
- Clicking outline heart → `POST /api/favorites`, invalidate `['favorites']`
- Use `useMutation` for both — handle loading state on the icon (disable during mutation)

**Register route in server index:**
```typescript
import favoritesRoutes from './routes/favorites';
app.use('/api/favorites', favoritesRoutes);
```

---

## 7. Manual Food Entry

### Overview

When a user searches for a food and doesn't find it, they can add it manually. A "Lägg till manuellt" button appears at the bottom of the search results (always visible, not just when results are empty).

### Backend

`POST /api/food/custom` — already partially defined in `ARCHITECTURE.md`.

**Zod schema:**
```typescript
const CreateCustomFoodSchema = z.object({
  name:             z.string().min(1).max(255),
  caloriesPer100g:  z.number().int().nonnegative(),
  proteinPer100g:   z.number().nonnegative(),
  carbsPer100g:     z.number().nonnegative(),
  fatPer100g:       z.number().nonnegative(),
  defaultServingG:  z.number().positive().optional(),
});
```

**Files to update:**
- `server/src/routes/search.ts` — add POST route for custom foods
- `server/src/controllers/search.controller.ts` — add `createCustomFood`
- `server/src/services/search.service.ts` — add `createCustomFood`
- `server/src/db/queries/food.queries.ts` — add insert into `custom_foods`

**Custom foods in search results:**

Update `GET /api/search/food` to also query `custom_foods` for the current user and merge results with Livsmedelsverket/Open Food Facts results. Custom foods should appear first in results — the user added them specifically because they want to use them.

```typescript
// In search.service.ts searchFood():
const customFoods = await searchCustomFoods(userId, query);
const apiResults = await searchLivsmedelsverketOrFallback(query);
return [...customFoods, ...apiResults].slice(0, 15);
```

The `searchFood` service must now accept `userId` as a parameter. Update the controller to pass `getAuth(req).userId` to the service.

### Frontend: AddCustomFoodModal

Create `client/src/components/food/AddCustomFoodModal.tsx`.

Props:
```typescript
type AddCustomFoodModalProps = {
  initialName?: string; // pre-fill name from search query
  onClose: () => void;
  onSaved: (food: FoodSearchResult) => void;
};
```

Form fields (all required unless noted):
- Namn (pre-filled with search query if provided)
- Kalorier per 100g (number)
- Protein per 100g (number)
- Kolhydrater per 100g (number)
- Fett per 100g (number)
- Standardportion i gram (optional — if provided, pre-fills serving input)

Use `react-hook-form` + `zod` for validation. On success:
- Close the modal
- Call `onSaved` with the new food as a `FoodSearchResult` so it can be immediately selected for logging
- Invalidate search cache for the current query

### Button in FoodLog

At the bottom of search results, always show:
```
Hittar du inte vad du letar efter?
[+ Lägg till livsmedel manuellt]
```

Clicking opens `AddCustomFoodModal` with `initialName` pre-filled from the current search query.

---

## 8. Portion Size Improvements

### Overview

Currently all foods default to 100g. Improve this by using a known `defaultServingG` when available, and showing portion context to the user.

### Changes to FoodSearchResult type

Add `defaultServingG` to the type in `client/src/types/index.ts`:

```typescript
export type FoodSearchResult = {
  name: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  imageUrl: string | null;
  source: 'livsmedelsverket' | 'open_food_facts' | 'custom';
  defaultServingG: number | null; // NEW
};
```

Also update the backend `FoodSearchResult` type in `server/src/types/index.ts` to match.

### Default Serving Logic

| Source | defaultServingG |
|--------|----------------|
| Livsmedelsverket | `null` (always per 100g, no portion data) |
| Open Food Facts | Parse from `product.serving_quantity` if present, else `null` |
| Custom food | Use `defaultServingG` field if user provided it, else `null` |
| Favorites | Use `default_serving_g` from `user_favorites` table |
| Recent foods | Use the `serving_g` from the most recent log of that food |

### Serving Size Input Behaviour

In the serving size input when adding a food:

```typescript
const defaultServing = food.defaultServingG ?? 100;
const [servingG, setServingG] = useState(defaultServing);
```

Below the input, show context text:
- If `defaultServingG` is set: `"1 portion = {defaultServingG}g"`
- If `defaultServingG` is null: `"Per 100g"`

The input always allows free typing — the default is just a pre-fill, not a lock.

---

## 9. New API Endpoints

Summary of all new routes added in Phase 2:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/api/food/log/:id` | ✓ | Edit a logged food entry |
| GET | `/api/food/recent` | ✓ | Get recently logged foods (30 days) |
| POST | `/api/food/custom` | ✓ | Create a custom food |
| GET | `/api/favorites` | ✓ | Get user's favorite foods |
| POST | `/api/favorites` | ✓ | Add a food to favorites |
| DELETE | `/api/favorites/:id` | ✓ | Remove a food from favorites |

All routes follow the layer pattern: route → controller → service → queries.
All POST/PUT routes have `validateBody(schema)` middleware.
All routes have `requireAuth` middleware.

---

## 10. New File Structure

Files to create in Phase 2 (additions to existing structure):

```
server/
├── migrations/
│   ├── 005_create_user_favorites.sql        NEW
│   └── 006_add_put_food_log.sql             NEW
├── src/
│   ├── routes/
│   │   └── favorites.ts                     NEW
│   ├── controllers/
│   │   └── favorites.controller.ts          NEW
│   ├── services/
│   │   └── favorites.service.ts             NEW
│   └── db/
│       └── queries/
│           └── favorites.queries.ts         NEW

client/src/
├── lib/
│   └── mealRecommendations.ts               NEW
├── hooks/
│   ├── useFavorites.ts                      NEW
│   └── useRecentFoods.ts                    NEW
├── components/
│   ├── ui/
│   │   └── Tooltip.tsx                      NEW
│   ├── food/
│   │   ├── EditFoodModal.tsx                NEW
│   │   ├── AddCustomFoodModal.tsx           NEW
│   │   └── QuickFoodCard.tsx               NEW
│   └── dashboard/
│       └── FoodLogItem.tsx                  MODIFY — add pencil icon
└── pages/
    ├── FoodLog.tsx                          MODIFY — add quick tabs
    └── Dashboard.tsx                        MODIFY — add tooltips, meal ranges
```

Files to modify:
- `server/src/db/types.ts` — add `UserFavoritesTable`
- `server/src/index.ts` — register favorites route
- `server/src/routes/food.ts` — add PUT and GET recent routes
- `server/src/controllers/food.controller.ts` — add updateFoodEntry, getRecentFoods
- `server/src/services/food.service.ts` — add updateFoodEntry, getRecentFoods
- `server/src/services/search.service.ts` — accept userId, merge custom foods
- `server/src/db/queries/food.queries.ts` — add update and recent queries
- `client/src/types/index.ts` — add defaultServingG, FavoriteFood, RecentFood, QuickTab, MEAL_LABELS (if not already added)
- `client/src/components/food/FoodCard.tsx` — add heart icon
- `client/src/components/dashboard/MealSection.tsx` — add calorie range

---

## 11. Build Order

Build in this exact sequence. Each step must be complete and working before starting the next.

**Step 1 — Database**
- Run migration 005 (`user_favorites` table)
- Update `db/types.ts` with `UserFavoritesTable`

**Step 2 — Meal calorie recommendations (frontend only)**
- Create `lib/mealRecommendations.ts`
- Update `MealSection.tsx` to show range or logged kcal

**Step 3 — Macro tooltips (frontend only)**
- Create `components/ui/Tooltip.tsx`
- Wrap macro cards in Dashboard with tooltips

**Step 4 — Edit logged food**
- Add `PUT /api/food/log/:id` (route, controller, service, query)
- Create `EditFoodModal.tsx`
- Add pencil icon to `FoodLogItem.tsx`

**Step 5 — Recently added foods**
- Add `GET /api/food/recent` (route, controller, service, query)
- Create `useRecentFoods.ts`
- Create `QuickFoodCard.tsx`

**Step 6 — Quick tabs in FoodLog**
- Update `FoodLog.tsx` with segmented control
- Wire Nyligen tab to `useRecentFoods`
- Wire Denna måltid tab to `useDailyLog` filtered by mealType

**Step 7 — Favorites**
- Add `GET`, `POST`, `DELETE /api/favorites` (route, controller, service, queries)
- Create `useFavorites.ts`
- Add heart icon to `FoodCard.tsx`
- Wire Favoriter tab in FoodLog

**Step 8 — Manual food entry**
- Add `POST /api/food/custom` route
- Update `searchFood` service to merge custom foods (requires userId param)
- Create `AddCustomFoodModal.tsx`
- Add "Lägg till manuellt" button to FoodLog search results

**Step 9 — Portion size improvements**
- Add `defaultServingG` to `FoodSearchResult` type (client and server)
- Update Open Food Facts normaliser to parse `serving_quantity`
- Update serving input to use `defaultServingG` as default
- Update recent foods to use last known `serving_g`

---

*End of Phase 2 Feature Architecture — FuelSync*
