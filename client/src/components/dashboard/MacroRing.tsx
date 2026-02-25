import { useState, useEffect } from 'react';

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
  const [animated, setAnimated] = useState(false);
  const percentage = target > 0 ? Math.min(consumed / target, 1) : 0;
  const targetOffset = CIRCUMFERENCE * (1 - percentage);

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 0);
    return () => clearTimeout(id);
  }, []);

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
          strokeLinecap="round"
          style={{
            strokeDashoffset: animated ? targetOffset : CIRCUMFERENCE,
            transition: 'stroke-dashoffset 0.8s ease-out',
          }}
        />
      </svg>
      <p className="mt-1.5 text-sm font-semibold uppercase tracking-wide text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">
        {Math.round(consumed)}{unit} / {Math.round(target)}{unit}
      </p>
    </div>
  );
};

export default MacroRing;
