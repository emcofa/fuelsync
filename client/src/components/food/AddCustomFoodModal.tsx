import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { queryKeys, type FoodSearchResult } from '../../types';

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
          <div>
            <label htmlFor="cf-name" className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="cf-name"
              type="text"
              {...register('name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cf-cal" className="mb-1 block text-sm font-medium text-gray-700">
                Calories per 100g
              </label>
              <input
                id="cf-cal"
                type="number"
                {...register('caloriesPer100g')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.caloriesPer100g && (
                <p className="mt-1 text-xs text-red-500">{errors.caloriesPer100g.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="cf-protein" className="mb-1 block text-sm font-medium text-gray-700">
                Protein per 100g
              </label>
              <input
                id="cf-protein"
                type="number"
                step="0.1"
                {...register('proteinPer100g')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.proteinPer100g && (
                <p className="mt-1 text-xs text-red-500">{errors.proteinPer100g.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="cf-carbs" className="mb-1 block text-sm font-medium text-gray-700">
                Carbs per 100g
              </label>
              <input
                id="cf-carbs"
                type="number"
                step="0.1"
                {...register('carbsPer100g')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.carbsPer100g && (
                <p className="mt-1 text-xs text-red-500">{errors.carbsPer100g.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="cf-fat" className="mb-1 block text-sm font-medium text-gray-700">
                Fat per 100g
              </label>
              <input
                id="cf-fat"
                type="number"
                step="0.1"
                {...register('fatPer100g')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.fatPer100g && (
                <p className="mt-1 text-xs text-red-500">{errors.fatPer100g.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cf-serving" className="mb-1 block text-sm font-medium text-gray-700">
              Default serving (g) <span className="text-gray-400">— optional</span>
            </label>
            <input
              id="cf-serving"
              type="number"
              step="0.1"
              {...register('defaultServingG')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-40"
            />
            {errors.defaultServingG && (
              <p className="mt-1 text-xs text-red-500">{errors.defaultServingG.message}</p>
            )}
          </div>

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
