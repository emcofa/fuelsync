import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().int().min(1, 'Must be at least 1').max(150, 'Must be at most 150'),
  weightKg: z.coerce.number().min(20, 'Must be at least 20').max(500, 'Must be at most 500'),
  heightCm: z.coerce.number().int().min(50, 'Must be at least 50').max(300, 'Must be at most 300'),
  sex: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goalType: z.enum(['cut', 'bulk', 'maintain']),
  dietType: z.enum(['standard', 'vegetarian', 'vegan', 'pescetarian', 'keto', 'paleo']),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
