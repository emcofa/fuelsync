import MacroRing from './MacroRing';
import Tooltip from '../ui/Tooltip';

type MacroRingWithTooltipProps = {
  label: string;
  consumed: number;
  target: number;
  color: string;
  description: string;
  kcalPerGram: number;
};

const MacroRingWithTooltip = ({ label, consumed, target, color, description, kcalPerGram }: MacroRingWithTooltipProps) => (
  <Tooltip
    content={
      <div className="space-y-1 text-xs">
        <p>Target: {Math.round(target)}g</p>
        <p>Consumed: {Math.round(consumed)}g</p>
        <p>Remaining: {Math.round(Math.max(0, target - consumed))}g</p>
        <p className="pt-1 text-gray-300">{description}</p>
        <p className="text-gray-300">{kcalPerGram} kcal per gram.</p>
      </div>
    }
  >
    <MacroRing
      label={label}
      consumed={consumed}
      target={target}
      unit="g"
      color={color}
    />
  </Tooltip>
);

export default MacroRingWithTooltip;
