import clsx from 'clsx';
import type { GoalMode } from '../../types';

type GoalModeCardProps = {
  mode: GoalMode;
  title: string;
  description: string;
  isActive: boolean;
  onSelect: (mode: GoalMode) => void;
};

const MODE_COLORS: Record<GoalMode, { border: string; bg: string; text: string }> = {
  cut: { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-700' },
  bulk: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
  maintain: { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700' },
};

const GoalModeCard = ({ mode, title, description, isActive, onSelect }: GoalModeCardProps) => {
  const colors = MODE_COLORS[mode];

  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={clsx(
        'w-full rounded-lg border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        isActive
          ? `${colors.border} ${colors.bg}`
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <h3 className={clsx('text-lg font-semibold', isActive ? colors.text : 'text-gray-900')}>
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </button>
  );
};

export default GoalModeCard;
