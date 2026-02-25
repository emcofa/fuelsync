import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '../lib/api';
import { profileSchema, type ProfileFormValues } from '../lib/validators';
import { queryKeys, type UserProfile } from '../types';
import { useEffect } from 'react';
import FormField from '../components/ui/FormField';

const INPUT_CLASS = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

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
    return <p className="py-12 text-center text-gray-500">Loading profile...</p>;
  }

  if (isError) {
    return <p className="py-12 text-center text-red-500">Failed to load profile. Please try again.</p>;
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <legend className="px-2 text-sm font-medium text-gray-700">Personal Info</legend>

          <FormField htmlFor="name" label="Name" error={errors.name?.message}>
            <input id="name" type="text" {...register('name')} className={INPUT_CLASS} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="age" label="Age" error={errors.age?.message}>
              <input id="age" type="number" {...register('age')} className={INPUT_CLASS} />
            </FormField>

            <FormField htmlFor="sex" label="Sex" error={errors.sex?.message}>
              <select id="sex" {...register('sex')} className={INPUT_CLASS}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="weightKg" label="Weight (kg)" error={errors.weightKg?.message}>
              <input id="weightKg" type="number" step="0.1" {...register('weightKg')} className={INPUT_CLASS} />
            </FormField>

            <FormField htmlFor="heightCm" label="Height (cm)" error={errors.heightCm?.message}>
              <input id="heightCm" type="number" {...register('heightCm')} className={INPUT_CLASS} />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <legend className="px-2 text-sm font-medium text-gray-700">Fitness & Diet</legend>

          <FormField htmlFor="activityLevel" label="Activity Level" error={errors.activityLevel?.message}>
            <select id="activityLevel" {...register('activityLevel')} className={INPUT_CLASS}>
              <option value="">Select...</option>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          <FormField htmlFor="goalType" label="Goal" error={errors.goalType?.message}>
            <select id="goalType" {...register('goalType')} className={INPUT_CLASS}>
              <option value="cut">Cut (lose fat)</option>
              <option value="bulk">Bulk (gain muscle)</option>
              <option value="maintain">Maintain (recomp)</option>
            </select>
          </FormField>

          <FormField htmlFor="dietType" label="Diet Type" error={errors.dietType?.message}>
            <select id="dietType" {...register('dietType')} className={INPUT_CLASS}>
              {Object.entries(DIET_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>
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
    </>
  );
};

export default Profile;
