import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import * as favoritesController from '../controllers/favorites.controller';
import { z } from 'zod';

const router = Router();

const addFavoriteSchema = z.object({
  foodName: z.string().min(1),
  barcode: z.string().nullable().optional(),
  caloriesPer100g: z.number().min(0),
  proteinPer100g: z.number().min(0),
  carbsPer100g: z.number().min(0),
  fatPer100g: z.number().min(0),
  defaultServingG: z.number().positive().optional(),
  source: z.enum(['livsmedelsverket', 'open_food_facts', 'custom']),
});

router.get('/', requireAuth, favoritesController.getFavorites);
router.post('/', requireAuth, validateBody(addFavoriteSchema), favoritesController.addFavorite);
router.delete('/:id', requireAuth, favoritesController.removeFavorite);

export default router;
