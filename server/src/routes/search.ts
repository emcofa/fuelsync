import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import * as searchController from '../controllers/search.controller';

const createCustomFoodSchema = z.object({
  name: z.string().min(1).max(255),
  caloriesPer100g: z.number().int().nonnegative(),
  proteinPer100g: z.number().nonnegative(),
  carbsPer100g: z.number().nonnegative(),
  fatPer100g: z.number().nonnegative(),
  defaultServingG: z.number().positive().optional(),
});

const router = Router();

router.get('/food', requireAuth, searchController.searchFood);
router.get('/barcode/:code', requireAuth, searchController.searchBarcode);
router.post('/custom', requireAuth, validateBody(createCustomFoodSchema), searchController.createCustomFood);

export default router;
