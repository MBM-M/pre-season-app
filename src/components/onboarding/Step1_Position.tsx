import { FOOTBALL_POSITIONS, FootballPosition } from '@/types/onboarding';
import { OptionCard } from '@/components/ui/OptionCard';

interface Step1PositionProps {
  selected: FootballPosition | null;
  onSelect: (position: FootballPosition) => void;
}

export const Step1_Position = ({ selected, onSelect }: Step1PositionProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">What position do you play?</h1>
        <p className="text-gray-400">Training plans are optimized for your position</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FOOTBALL_POSITIONS.map((position) => (
          <OptionCard
            key={position.value}
            selected={selected === position.value}
            onClick={() => onSelect(position.value)}
          >
            <div className="text-xl font-semibold">{position.label}</div>
          </OptionCard>
        ))}
      </div>
    </div>
  );
};
