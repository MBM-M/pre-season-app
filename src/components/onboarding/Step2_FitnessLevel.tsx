import { FITNESS_LEVELS, FitnessLevel } from '@/types/onboarding';
import { SelectableOption } from '@/components/ui/OptionCard';
import { EducationCard } from '@/components/ui/EducationCard';

interface Step2FitnessLevelProps {
  selected: FitnessLevel | null;
  onSelect: (level: FitnessLevel) => void;
}

export const Step2_FitnessLevel = ({ selected, onSelect }: Step2FitnessLevelProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">How would you describe your fitness level?</h1>
        <p className="text-gray-400">This helps us set the right intensity</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {FITNESS_LEVELS.map((level) => (
          <SelectableOption
            key={level.value}
            label={level.label}
            description={level.description}
            selected={selected === level.value}
            onClick={() => onSelect(level.value)}
          />
        ))}
      </div>

      <EducationCard
        title="Every level can improve dramatically"
        icon="💪"
        content="Research in sports science demonstrates that athletes at all fitness levels show significant improvements with proper training. Beginners typically see the fastest gains — often 20-30% improvements in just 6 weeks. Intermediate and advanced athletes continue to benefit from periodized training, with studies showing consistent performance gains when intensity and volume are properly managed. The key is training at the right level for your current fitness."
        source="European Journal of Sport Science, 2021; Journal of Sports Sciences, 2020"
      />
    </div>
  );
};
