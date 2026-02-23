import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import * as aiController from '../controllers/ai.controller';
import { z } from 'zod';

const router = Router();

const suggestSchema = z.object({
  remainingCalories: z.number(),
  remainingProteinG: z.number(),
  remainingCarbsG: z.number(),
  remainingFatG: z.number(),
  goalMode: z.enum(['cut', 'bulk', 'maintain']),
  dietType: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

router.post('/suggest', requireAuth, validateBody(suggestSchema), aiController.suggest);

export default router;
