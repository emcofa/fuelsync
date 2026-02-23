import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import * as goalsController from '../controllers/goals.controller';
import { z } from 'zod';

const router = Router();

const updateGoalsSchema = z.object({
  calories: z.number().int().min(0),
  proteinG: z.number().int().min(0),
  carbsG: z.number().int().min(0),
  fatG: z.number().int().min(0),
});

router.get('/', requireAuth, goalsController.getGoals);
router.put('/', requireAuth, validateBody(updateGoalsSchema), goalsController.updateGoals);
router.post('/reset', requireAuth, goalsController.resetGoals);

export default router;
