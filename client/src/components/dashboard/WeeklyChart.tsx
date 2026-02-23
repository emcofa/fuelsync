import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DailyMacroSummary } from '../../types';

type WeeklyChartProps = {
  data: DailyMacroSummary[];
  dataKey: 'totalCalories' | 'totalProteinG' | 'totalCarbsG' | 'totalFatG';
  label: string;
  color: string;
  unit: string;
};

const WeeklyChart = ({ data, dataKey, label, color, unit }: WeeklyChartProps) => {
  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    [label]: d[dataKey],
  }));

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">{label} (last 7 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [`${value} ${unit}`, label]}
            labelFormatter={(l: string) => `Date: ${l}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={label}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default WeeklyChart;
