import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type MacroTargets, type GoalMode, type UserProfile } from '../types';
import GoalModeCard from '../components/goals/GoalModeCard';
import MacroEditor from '../components/goals/MacroEditor';

const GOAL_MODES: { mode: GoalMode; title: string; description: string }[] = [
  {
    mode: 'cut',
    title: 'Cut',
    description: 'Lose fat while preserving muscle. TDEE minus 400 kcal deficit.',
  },
  {
    mode: 'bulk',
    title: 'Bulk',
    description: 'Gain muscle with minimal fat gain. TDEE plus 300 kcal surplus.',
  },
  {
    mode: 'maintain',
    title: 'Maintain',
    description: 'Hold current weight with body recomp focus. TDEE exactly.',
  },
];

const Goals = () => {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => apiFetch<UserProfile>('/user/profile'),
  });

  const {
    data: targets,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.macroTargets(),
    queryFn: () => apiFetch<MacroTargets>('/goals'),
  });

  const goalModeMutation = useMutation({
    mutationFn: (goalType: GoalMode) =>
      apiFetch<UserProfile>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ goalType }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.macroTargets() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: { calories: number; proteinG: number; carbsG: number; fatG: number }) =>
      apiFetch<MacroTargets>('/goals', {
        method: 'PUT',
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.macroTargets() });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      apiFetch<MacroTargets>('/goals/reset', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.macroTargets() });
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading goals...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Failed to load goals. Complete your profile first.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Goals</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Goal Mode</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {GOAL_MODES.map(({ mode, title, description }) => (
            <GoalModeCard
              key={mode}
              mode={mode}
              title={title}
              description={description}
              isActive={profile?.goalType === mode}
              onSelect={(m) => goalModeMutation.mutate(m)}
            />
          ))}
        </div>
        {goalModeMutation.isPending && (
          <p className="mt-2 text-sm text-gray-500">Updating goal mode...</p>
        )}
      </section>

      {targets && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Macro Targets</h2>
            {targets.isCustom ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Custom
              </span>
            ) : (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Calculated
              </span>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <MacroEditor
              targets={targets}
              onSave={(values) => updateMutation.mutate(values)}
              onReset={() => resetMutation.mutate()}
              isSaving={updateMutation.isPending}
              isResetting={resetMutation.isPending}
            />
          </div>

          {updateMutation.isSuccess && (
            <p className="mt-2 text-sm text-green-600">Custom targets saved.</p>
          )}
          {resetMutation.isSuccess && (
            <p className="mt-2 text-sm text-green-600">Targets reset to calculated values.</p>
          )}
          {(updateMutation.isError || resetMutation.isError) && (
            <p className="mt-2 text-sm text-red-600">Something went wrong. Please try again.</p>
          )}
        </section>
      )}
    </main>
  );
};

export default Goals;
