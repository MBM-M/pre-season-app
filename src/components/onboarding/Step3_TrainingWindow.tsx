import { WEEKS_OPTIONS, WeeksAvailable } from '@/types/onboarding';
import { OptionCard } from '@/components/ui/OptionCard';
import { EducationCard } from '@/components/ui/EducationCard';

interface Step3TrainingWindowProps {
  selected: WeeksAvailable | null;
  onSelect: (weeks: WeeksAvailable) => void;
}

export const Step3_TrainingWindow = ({ selected, onSelect }: Step3TrainingWindowProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">How long can you commit to training?</h1>
        <p className="text-gray-400">We'll build a plan that fits your timeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {WEEKS_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            selected={selected === option.value}
            onClick={() => onSelect(option.value)}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{option.value}</div>
              <div className="text-sm text-gray-400 mt-1">weeks</div>
              <div className="text-xs text-gray-500 mt-1">({option.months})</div>
            </div>
          </OptionCard>
        ))}
      </div>

      <EducationCard
        title="Why training duration matters"
        icon="📚"
        content="Research shows that consistent training over 6-8 weeks produces significantly better results than shorter bursts. A study in the Journal of Sports Sciences found that athletes need at least 6 weeks to see measurable improvements in speed, strength, and endurance. Longer training periods allow for progressive overload and proper recovery cycles."
        source="Journal of Sports Sciences, 2019; Sports Medicine, 2020"
      />
    </div>
  );
};
