import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '../lib/api';
import { profileSchema, type ProfileFormValues } from '../lib/validators';
import { queryKeys, type UserProfile } from '../types';
import { useEffect } from 'react';

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Light (1-3 days/week)',
  moderate: 'Moderate (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  very_active: 'Very Active (intense daily exercise)',
};

const DIET_LABELS: Record<string, string> = {
  standard: 'Standard',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescetarian: 'Pescetarian',
  keto: 'Keto',
  paleo: 'Paleo',
};

const Profile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => apiFetch<UserProfile>('/user/profile'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? '',
        age: profile.age ?? undefined,
        weightKg: profile.weightKg ?? undefined,
        heightCm: profile.heightCm ?? undefined,
        sex: profile.sex ?? undefined,
        activityLevel: profile.activityLevel ?? undefined,
        goalType: profile.goalType,
        dietType: profile.dietType,
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      apiFetch<UserProfile>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.macroTargets() });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Failed to load profile. Please try again.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <legend className="px-2 text-sm font-medium text-gray-700">Personal Info</legend>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                id="age"
                type="number"
                {...register('age')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
            </div>

            <div>
              <label htmlFor="sex" className="mb-1 block text-sm font-medium text-gray-700">
                Sex
              </label>
              <select
                id="sex"
                {...register('sex')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weightKg" className="mb-1 block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                id="weightKg"
                type="number"
                step="0.1"
                {...register('weightKg')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.weightKg && <p className="mt-1 text-sm text-red-600">{errors.weightKg.message}</p>}
            </div>

            <div>
              <label htmlFor="heightCm" className="mb-1 block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                id="heightCm"
                type="number"
                {...register('heightCm')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.heightCm && <p className="mt-1 text-sm text-red-600">{errors.heightCm.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <legend className="px-2 text-sm font-medium text-gray-700">Fitness & Diet</legend>

          <div>
            <label htmlFor="activityLevel" className="mb-1 block text-sm font-medium text-gray-700">
              Activity Level
            </label>
            <select
              id="activityLevel"
              {...register('activityLevel')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.activityLevel && <p className="mt-1 text-sm text-red-600">{errors.activityLevel.message}</p>}
          </div>

          <div>
            <label htmlFor="goalType" className="mb-1 block text-sm font-medium text-gray-700">
              Goal
            </label>
            <select
              id="goalType"
              {...register('goalType')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="cut">Cut (lose fat)</option>
              <option value="bulk">Bulk (gain muscle)</option>
              <option value="maintain">Maintain (recomp)</option>
            </select>
            {errors.goalType && <p className="mt-1 text-sm text-red-600">{errors.goalType.message}</p>}
          </div>

          <div>
            <label htmlFor="dietType" className="mb-1 block text-sm font-medium text-gray-700">
              Diet Type
            </label>
            <select
              id="dietType"
              {...register('dietType')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {Object.entries(DIET_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.dietType && <p className="mt-1 text-sm text-red-600">{errors.dietType.message}</p>}
          </div>
        </fieldset>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          {mutation.isSuccess && (
            <p className="text-sm text-green-600">Profile updated successfully.</p>
          )}
          {mutation.isError && (
            <p className="text-sm text-red-600">Failed to save. Please try again.</p>
          )}
        </div>
      </form>
    </main>
  );
};

export default Profile;
