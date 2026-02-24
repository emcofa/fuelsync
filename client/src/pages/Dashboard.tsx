import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { queryKeys, MEAL_LABELS, type MealType, type UserProfile } from '../types';
import { useDailyLog } from '../hooks/useDailyLog';
import { useMacroTargets } from '../hooks/useMacroTargets';
import DateNavigator from '../components/dashboard/DateNavigator';
import CalorieBar from '../components/dashboard/CalorieBar';
import MacroRing from '../components/dashboard/MacroRing';
import MealSection from '../components/dashboard/MealSection';
import AISuggestionPanel from '../components/ai/AISuggestionPanel';

const MEAL_SECTIONS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const formatDateParam = (date: Date): string =>
  date.toISOString().split('T')[0];

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = formatDateParam(selectedDate);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: log, isLoading: logLoading, isError: logError } = useDailyLog(dateStr);
  const { data: targets, isLoading: targetsLoading, isError: targetsError } = useMacroTargets();
  const { data: profile } = useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => apiFetch<UserProfile>('/user/profile'),
  });

  const deleteMutation = useMutation({
    mutationFn: (entryId: number) => {
      setDeletingId(entryId);
      return apiFetch<{ success: boolean }>(`/food/log/${entryId}`, { method: 'DELETE' });
    },
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLog(dateStr) });
    },
  });

  if (logLoading || targetsLoading) {
    return <p className="py-12 text-center text-gray-500">Loading dashboard...</p>;
  }

  const needsSetup = targetsError || !targets;

  if (logError && !needsSetup) {
    return <p className="py-12 text-center text-red-500">Failed to load dashboard. Please try again.</p>;
  }

  if (needsSetup && !targetsLoading) {
    return (
      <>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>
        <section className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Welcome to FuelSync</h2>
          <p className="mb-6 text-gray-600">
            Set up your profile so we can calculate your daily macro targets.
          </p>
          <Link
            to="/profile"
            className="inline-block rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Set Up Profile
          </Link>
        </section>
      </>
    );
  }

  const consumed = {
    calories: log?.totalCalories ?? 0,
    proteinG: log?.totalProteinG ?? 0,
    carbsG: log?.totalCarbsG ?? 0,
    fatG: log?.totalFatG ?? 0,
  };

  const target = {
    calories: targets?.calories ?? 0,
    proteinG: targets?.proteinG ?? 0,
    carbsG: targets?.carbsG ?? 0,
    fatG: targets?.fatG ?? 0,
  };

  return (
    <>
      <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <CalorieBar consumed={consumed.calories} target={target.calories} />

        <div className="mt-6 flex justify-around">
          <MacroRing
            label="Protein"
            consumed={consumed.proteinG}
            target={target.proteinG}
            unit="g"
            color="#8b5cf6"
          />
          <MacroRing
            label="Carbs"
            consumed={consumed.carbsG}
            target={target.carbsG}
            unit="g"
            color="#f59e0b"
          />
          <MacroRing
            label="Fat"
            consumed={consumed.fatG}
            target={target.fatG}
            unit="g"
            color="#10b981"
          />
        </div>
      </section>

      <div className="space-y-4">
        {MEAL_SECTIONS.map((type) => (
          <MealSection
            key={type}
            mealType={type}
            label={MEAL_LABELS[type]}
            entries={log?.entries ?? []}
            onDelete={(id) => deleteMutation.mutate(id)}
            deletingId={deletingId}
            date={dateStr}
          />
        ))}
      </div>

      {profile && (
        <div className="mt-6">
          <AISuggestionPanel
            remainingCalories={Math.max(0, target.calories - consumed.calories)}
            remainingProteinG={Math.max(0, target.proteinG - consumed.proteinG)}
            remainingCarbsG={Math.max(0, target.carbsG - consumed.carbsG)}
            remainingFatG={Math.max(0, target.fatG - consumed.fatG)}
            goalMode={profile.goalType}
            dietType={profile.dietType}
          />
        </div>
      )}
    </>
  );
};

export default Dashboard;
