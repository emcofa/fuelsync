import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MacroTargets } from '../../types';

const macroOverrideSchema = z.object({
  calories: z.coerce.number().int().min(0, 'Must be 0 or more'),
  proteinG: z.coerce.number().int().min(0, 'Must be 0 or more'),
  carbsG: z.coerce.number().int().min(0, 'Must be 0 or more'),
  fatG: z.coerce.number().int().min(0, 'Must be 0 or more'),
});

type MacroOverrideValues = z.infer<typeof macroOverrideSchema>;

type MacroEditorProps = {
  targets: MacroTargets;
  onSave: (values: MacroOverrideValues) => void;
  onReset: () => void;
  isSaving: boolean;
  isResetting: boolean;
};

const MacroEditor = ({ targets, onSave, onReset, isSaving, isResetting }: MacroEditorProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MacroOverrideValues>({
    resolver: zodResolver(macroOverrideSchema),
    defaultValues: {
      calories: targets.calories,
      proteinG: targets.proteinG,
      carbsG: targets.carbsG,
      fatG: targets.fatG,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="calories" className="mb-1 block text-sm font-medium text-gray-700">
            Calories (kcal)
          </label>
          <input
            id="calories"
            type="number"
            {...register('calories')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.calories && <p className="mt-1 text-sm text-red-600">{errors.calories.message}</p>}
        </div>

        <div>
          <label htmlFor="proteinG" className="mb-1 block text-sm font-medium text-gray-700">
            Protein (g)
          </label>
          <input
            id="proteinG"
            type="number"
            {...register('proteinG')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.proteinG && <p className="mt-1 text-sm text-red-600">{errors.proteinG.message}</p>}
        </div>

        <div>
          <label htmlFor="carbsG" className="mb-1 block text-sm font-medium text-gray-700">
            Carbs (g)
          </label>
          <input
            id="carbsG"
            type="number"
            {...register('carbsG')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.carbsG && <p className="mt-1 text-sm text-red-600">{errors.carbsG.message}</p>}
        </div>

        <div>
          <label htmlFor="fatG" className="mb-1 block text-sm font-medium text-gray-700">
            Fat (g)
          </label>
          <input
            id="fatG"
            type="number"
            {...register('fatG')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.fatG && <p className="mt-1 text-sm text-red-600">{errors.fatG.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty || isSaving}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Custom Targets'}
        </button>

        {targets.isCustom && (
          <button
            type="button"
            onClick={onReset}
            disabled={isResetting}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? 'Resetting...' : 'Reset to Calculated'}
          </button>
        )}
      </div>
    </form>
  );
};

export default MacroEditor;
