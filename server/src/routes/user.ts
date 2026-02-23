import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validateBody';
import * as userController from '../controllers/user.controller';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().min(1).max(150).optional(),
  weightKg: z.number().min(20).max(500).optional(),
  heightCm: z.number().int().min(50).max(300).optional(),
  sex: z.enum(['male', 'female']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goalType: z.enum(['cut', 'bulk', 'maintain']).optional(),
  dietType: z.enum(['standard', 'vegetarian', 'vegan', 'pescetarian', 'keto', 'paleo']).optional(),
});

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, validateBody(updateProfileSchema), userController.updateProfile);

export default router;
