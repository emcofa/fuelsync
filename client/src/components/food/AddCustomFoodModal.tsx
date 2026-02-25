import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { queryKeys, type FoodSearchResult } from '../../types';
import FormField from '../ui/FormField';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  caloriesPer100g: z.coerce.number().int().nonnegative('Must be 0 or more'),
  proteinPer100g: z.coerce.number().nonnegative('Must be 0 or more'),
  carbsPer100g: z.coerce.number().nonnegative('Must be 0 or more'),
  fatPer100g: z.coerce.number().nonnegative('Must be 0 or more'),
  defaultServingG: z.coerce.number().positive('Must be greater than 0').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

type AddCustomFoodModalProps = {
  initialName?: string;
  onClose: () => void;
  onSaved: (food: FoodSearchResult) => void;
};

const INPUT_CLASS = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

const MACRO_FIELDS = [
  { id: 'cf-cal', name: 'caloriesPer100g' as const, label: 'Calories per 100g' },
  { id: 'cf-protein', name: 'proteinPer100g' as const, label: 'Protein per 100g', step: '0.1' },
  { id: 'cf-carbs', name: 'carbsPer100g' as const, label: 'Carbs per 100g', step: '0.1' },
  { id: 'cf-fat', name: 'fatPer100g' as const, label: 'Fat per 100g', step: '0.1' },
] as const;

const AddCustomFoodModal = ({ initialName, onClose, onSaved }: AddCustomFoodModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialName ?? '',
      caloriesPer100g: 0,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      defaultServingG: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const body = {
        name: data.name,
        caloriesPer100g: data.caloriesPer100g,
        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatPer100g: data.fatPer100g,
        ...(typeof data.defaultServingG === 'number' && data.defaultServingG > 0
          ? { defaultServingG: data.defaultServingG }
          : {}),
      };
      return apiFetch<FoodSearchResult>('/search/custom', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    onSuccess: (food) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foodSearch(initialName ?? '') });
      onSaved(food);
      onClose();
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Add custom food</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <FormField htmlFor="cf-name" label="Name" error={errors.name?.message}>
            <input id="cf-name" type="text" {...register('name')} className={INPUT_CLASS} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            {MACRO_FIELDS.map((field) => (
              <FormField key={field.id} htmlFor={field.id} label={field.label} error={errors[field.name]?.message}>
                <input
                  id={field.id}
                  type="number"
                  step={field.step}
                  {...register(field.name)}
                  className={INPUT_CLASS}
                />
              </FormField>
            ))}
          </div>

          <FormField htmlFor="cf-serving" label="Default serving (g) — optional" error={errors.defaultServingG?.message}>
            <input
              id="cf-serving"
              type="number"
              step="0.1"
              {...register('defaultServingG')}
              className={`${INPUT_CLASS} sm:w-40`}
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">Failed to save. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddCustomFoodModal;
