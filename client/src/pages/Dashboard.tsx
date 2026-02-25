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
import Tooltip from '../components/ui/Tooltip';
import AISuggestionPanel from '../components/ai/AISuggestionPanel';

const MEAL_SECTIONS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const formatDateParam = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

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
    <div className="mx-auto max-w-screen-xl px-6">
      <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="mt-6 lg:grid lg:grid-cols-[480px_1fr] lg:items-start lg:gap-8">
        {/* Left column — calorie hero + macro rings */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <CalorieBar consumed={consumed.calories} target={target.calories} />

          <div className="flex justify-around rounded-xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
            <Tooltip
              content={
                <div className="space-y-1 text-xs">
                  <p>Target: {Math.round(target.proteinG)}g</p>
                  <p>Consumed: {Math.round(consumed.proteinG)}g</p>
                  <p>Remaining: {Math.round(Math.max(0, target.proteinG - consumed.proteinG))}g</p>
                  <p className="pt-1 text-gray-300">Protein builds and preserves muscle mass.</p>
                  <p className="text-gray-300">4 kcal per gram.</p>
                </div>
              }
            >
              <MacroRing
                label="Protein"
                consumed={consumed.proteinG}
                target={target.proteinG}
                unit="g"
                color="#8b5cf6"
              />
            </Tooltip>
            <Tooltip
              content={
                <div className="space-y-1 text-xs">
                  <p>Target: {Math.round(target.carbsG)}g</p>
                  <p>Consumed: {Math.round(consumed.carbsG)}g</p>
                  <p>Remaining: {Math.round(Math.max(0, target.carbsG - consumed.carbsG))}g</p>
                  <p className="pt-1 text-gray-300">Carbs are the body's primary energy source.</p>
                  <p className="text-gray-300">4 kcal per gram.</p>
                </div>
              }
            >
              <MacroRing
                label="Carbs"
                consumed={consumed.carbsG}
                target={target.carbsG}
                unit="g"
                color="#f59e0b"
              />
            </Tooltip>
            <Tooltip
              content={
                <div className="space-y-1 text-xs">
                  <p>Target: {Math.round(target.fatG)}g</p>
                  <p>Consumed: {Math.round(consumed.fatG)}g</p>
                  <p>Remaining: {Math.round(Math.max(0, target.fatG - consumed.fatG))}g</p>
                  <p className="pt-1 text-gray-300">Fat is important for hormones and cell health.</p>
                  <p className="text-gray-300">9 kcal per gram.</p>
                </div>
              }
            >
              <MacroRing
                label="Fat"
                consumed={consumed.fatG}
                target={target.fatG}
                unit="g"
                color="#10b981"
              />
            </Tooltip>
          </div>
        </div>

        {/* Right column — meal sections */}
        <div className="mt-6 space-y-4 lg:mt-0">
          {MEAL_SECTIONS.map((type) => (
            <MealSection
              key={type}
              mealType={type}
              label={MEAL_LABELS[type]}
              entries={log?.entries ?? []}
              onDelete={(id) => deleteMutation.mutate(id)}
              deletingId={deletingId}
              date={dateStr}
              targetCalories={target.calories}
            />
          ))}

          {profile && (
            <AISuggestionPanel
              remainingCalories={Math.max(0, target.calories - consumed.calories)}
              remainingProteinG={Math.max(0, target.proteinG - consumed.proteinG)}
              remainingCarbsG={Math.max(0, target.carbsG - consumed.carbsG)}
              remainingFatG={Math.max(0, target.fatG - consumed.fatG)}
              goalMode={profile.goalType}
              dietType={profile.dietType}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
