import { GOAL_OPTIONS, PrimaryGoal } from '@/types/onboarding';
import { SelectableOption } from '@/components/ui/OptionCard';
import { EducationCard } from '@/components/ui/EducationCard';

interface Step7GoalProps {
  selected: PrimaryGoal | null;
  onSelect: (goal: PrimaryGoal) => void;
}

export const Step7_Goal = ({ selected, onSelect }: Step7GoalProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">What's your #1 goal this pre-season?</h1>
        <p className="text-gray-400">We'll prioritize what matters most to you</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {GOAL_OPTIONS.map((goal) => (
          <SelectableOption
            key={goal.value}
            label={goal.label}
            emoji={goal.emoji}
            selected={selected === goal.value}
            onClick={() => onSelect(goal.value)}
          />
        ))}
      </div>

      <EducationCard
        title="Goal-specific training works"
        icon="🎯"
        content="Sports science research confirms that goal-oriented training produces superior results. Athletes who train with specific goals (endurance, strength, speed, or skills) show 35-50% greater improvement in those areas compared to generic training. This is because different goals require different training approaches — endurance needs high-volume cardio, strength requires progressive resistance, speed demands plyometrics and sprints, while skills need focused technical drills. Your plan will be optimized for your primary goal."
        source="Journal of Strength and Conditioning Research, 2021; Sports Medicine, 2022"
      />
    </div>
  );
};
