import { useWeeklyProgress } from '../hooks/useWeeklyProgress';
import { useMacroTargets } from '../hooks/useMacroTargets';
import WeeklyChart from '../components/dashboard/WeeklyChart';

const Progress = () => {
  const { data: weekData, isLoading, isError } = useWeeklyProgress();
  const { data: targets } = useMacroTargets();

  if (isLoading) {
    return <p className="py-12 text-center text-gray-500">Loading progress...</p>;
  }

  if (isError || !weekData) {
    return <p className="py-12 text-center text-red-500">Failed to load progress data.</p>;
  }

  const avgCalories = weekData.length > 0
    ? Math.round(weekData.reduce((s, d) => s + d.totalCalories, 0) / weekData.length)
    : 0;
  const avgProtein = weekData.length > 0
    ? Math.round(weekData.reduce((s, d) => s + d.totalProteinG, 0) / weekData.length)
    : 0;

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Progress</h1>

      <section className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Avg Daily Calories</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{avgCalories} kcal</p>
          {targets && (
            <p className="mt-0.5 text-xs text-gray-400">Target: {targets.calories} kcal</p>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Avg Daily Protein</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{avgProtein}g</p>
          {targets && (
            <p className="mt-0.5 text-xs text-gray-400">Target: {targets.proteinG}g</p>
          )}
        </div>
      </section>

      <div className="space-y-4">
        <WeeklyChart
          data={weekData}
          dataKey="totalCalories"
          label="Calories"
          color="#6366f1"
          unit="kcal"
        />
        <WeeklyChart
          data={weekData}
          dataKey="totalProteinG"
          label="Protein"
          color="#8b5cf6"
          unit="g"
        />
        <WeeklyChart
          data={weekData}
          dataKey="totalCarbsG"
          label="Carbs"
          color="#f59e0b"
          unit="g"
        />
        <WeeklyChart
          data={weekData}
          dataKey="totalFatG"
          label="Fat"
          color="#10b981"
          unit="g"
        />
      </div>
    </>
  );
};

export default Progress;
