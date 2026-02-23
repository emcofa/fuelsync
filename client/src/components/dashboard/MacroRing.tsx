type MacroRingProps = {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
};

const RING_SIZE = 80;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MacroRing = ({ label, consumed, target, unit, color }: MacroRingProps) => {
  const percentage = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = CIRCUMFERENCE * (1 - percentage);
  const remaining = Math.max(target - consumed, 0);

  return (
    <div className="flex flex-col items-center">
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-1 text-xs font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">
        {Math.round(remaining)}{unit} left
      </p>
    </div>
  );
};

export default MacroRing;
