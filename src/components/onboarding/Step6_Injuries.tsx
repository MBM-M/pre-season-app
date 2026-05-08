import { INJURY_OPTIONS, InjuryArea } from '@/types/onboarding';
import { OptionCard } from '@/components/ui/OptionCard';
import { EducationCard } from '@/components/ui/EducationCard';

interface Step6InjuriesProps {
  selected: InjuryArea;
  injuryDetails: string;
  onSelect: (area: InjuryArea) => void;
  onDetailsChange: (details: string) => void;
}

export const Step6_Injuries = ({ selected, injuryDetails, onSelect, onDetailsChange }: Step6InjuriesProps) => {
  const showDetails = selected === 'other';

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Any injuries or physical limitations?</h1>
        <p className="text-gray-400">Your safety comes first — we'll work around it</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {INJURY_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            selected={selected === option.value}
            onClick={() => onSelect(option.value)}
          >
            <div className="text-center">
              <div className="font-semibold">{option.label}</div>
            </div>
          </OptionCard>
        ))}
      </div>

      {showDetails && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Please provide more details
          </label>
          <textarea
            value={injuryDetails}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="E.g., 'I have a minor shoulder strain from overhead movements..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>
      )}

      <EducationCard
        title="Training smart with injuries"
        icon="🏥"
        content="Research shows that modified training can maintain and even improve fitness while recovering from injuries. Studies in sports medicine demonstrate that athletes who adapt their training around injuries maintain 70-80% of their fitness gains and recover faster than those who stop completely. Your plan will include appropriate modifications — such as alternative exercises, reduced intensity, or targeted rehabilitation movements — to help you train safely while still making progress."
        source="British Journal of Sports Medicine, 2021; Physical Therapy in Sport, 2022"
      />
    </div>
  );
};
