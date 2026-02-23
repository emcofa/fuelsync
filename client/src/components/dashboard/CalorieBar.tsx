import clsx from 'clsx';

type CalorieBarProps = {
  consumed: number;
  target: number;
};

const CalorieBar = ({ consumed, target }: CalorieBarProps) => {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(target - consumed, 0);
  const isOver = consumed > target;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-sm font-medium text-gray-700">Calories</p>
        <p className="text-sm text-gray-500">
          <span className={clsx('font-semibold', isOver ? 'text-red-600' : 'text-gray-900')}>
            {consumed}
          </span>{' '}
          / {target} kcal
        </p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={clsx(
            'h-full rounded-full transition-all',
            isOver ? 'bg-red-500' : 'bg-indigo-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {isOver
          ? `${consumed - target} kcal over`
          : `${remaining} kcal remaining`}
      </p>
    </div>
  );
};

export default CalorieBar;
