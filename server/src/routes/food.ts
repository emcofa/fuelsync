import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import * as foodController from '../controllers/food.controller';
import { z } from 'zod';

const router = Router();

const logFoodSchema = z.object({
  foodName: z.string().min(1),
  barcode: z.string().optional(),
  caloriesPer100g: z.number().min(0),
  proteinPer100g: z.number().min(0),
  carbsPer100g: z.number().min(0),
  fatPer100g: z.number().min(0),
  servingG: z.number().min(1),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

router.post('/log', requireAuth, validateBody(logFoodSchema), foodController.logFood);
router.get('/log/today', requireAuth, foodController.getDailyLog);
router.delete('/log/:id', requireAuth, foodController.deleteEntry);

export default router;
