import { DAYS_OPTIONS, DaysPerWeek } from '@/types/onboarding';
import { OptionCard } from '@/components/ui/OptionCard';
import { EducationCard } from '@/components/ui/EducationCard';

interface Step4AvailabilityProps {
  selected: DaysPerWeek | null;
  onSelect: (days: DaysPerWeek) => void;
}

export const Step4_Availability = ({ selected, onSelect }: Step4AvailabilityProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">How many days per week can you train?</h1>
        <p className="text-gray-400">Be realistic — consistency beats intensity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DAYS_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            selected={selected === option.value}
            onClick={() => onSelect(option.value)}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400">{option.label}</div>
              <div className="text-sm text-gray-400 mt-2">days</div>
            </div>
          </OptionCard>
        ))}
      </div>

      <EducationCard
        title="The science of training frequency"
        icon="📈"
        content="Studies show that training 3-4 days per week optimizes muscle protein synthesis and skill development. Research published in the Journal of Strength and Conditioning Research found that spreading training across 3+ days produces 40% better gains than 1-2 day routines, even with total volume equal. Daily training can work with proper periodization, but rest days are crucial for recovery and adaptation."
        source="Journal of Strength and Conditioning Research, 2021; Frontiers in Physiology, 2022"
      />
    </div>
  );
};
