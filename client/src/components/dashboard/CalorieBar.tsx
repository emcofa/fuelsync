import { useState, useEffect } from 'react';

type CalorieBarProps = {
  consumed: number;
  target: number;
};

const RING_SIZE = 140;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CalorieBar = ({ consumed, target }: CalorieBarProps) => {
  const [animated, setAnimated] = useState(false);
  const percentage = target > 0 ? Math.min(consumed / target, 1) : 0;
  const targetOffset = CIRCUMFERENCE * (1 - percentage);
  const remaining = Math.max(target - consumed, 0);

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-400 p-6 text-white shadow-xl shadow-purple-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left — consumed */}
        <div className="text-center">
          <p className="text-2xl font-semibold">{consumed}</p>
          <p className="text-sm uppercase tracking-widest opacity-80">Ätit</p>
        </div>

        {/* Center — calorie ring */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={STROKE_WIDTH}
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="white"
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                style={{
                  strokeDashoffset: animated ? targetOffset : CIRCUMFERENCE,
                  transition: 'stroke-dashoffset 0.8s ease-out',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold leading-none">{remaining}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest opacity-80">Återstående</p>
            </div>
          </div>
          <p className="mt-2 text-sm opacity-70">Mål {target} kcal</p>
        </div>

        {/* Right — target */}
        <div className="text-center">
          <p className="text-2xl font-semibold">{target}</p>
          <p className="text-sm uppercase tracking-widest opacity-80">Mål</p>
        </div>
      </div>
    </div>
  );
};

export default CalorieBar;
