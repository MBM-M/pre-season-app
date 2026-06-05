import { INJURY_OPTIONS, InjuryArea } from '@/types/onboarding';
import { OptionCard } from '@/components/ui/OptionCard';
import { EducationCard } from '@/components/ui/EducationCard';

interface Step6InjuriesProps {
  selected: InjuryArea;
  injuryDetails: string;
  // Consent is collected during onboarding only. When these are omitted (e.g.
  // editing prefs in Settings, where consent was already given), the checkbox
  // is not shown.
  consent?: boolean;
  onSelect: (area: InjuryArea) => void;
  onDetailsChange: (details: string) => void;
  onConsentChange?: (consent: boolean) => void;
}

export const Step6_Injuries = ({ selected, injuryDetails, consent, onSelect, onDetailsChange, onConsentChange }: Step6InjuriesProps) => {
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

      {onConsentChange && (
        <label className="mt-6 flex items-start gap-3 p-4 bg-gray-900/60 border border-gray-700 rounded-xl cursor-pointer hover:border-gray-600 transition">
          <input
            type="checkbox"
            checked={!!consent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-emerald-500"
          />
          <span className="text-sm text-gray-300 leading-relaxed">
            I consent to Pre-Season processing my fitness level and injury information —
            which is health-related data — to personalize my training plan, including
            sending it to our AI provider (Anthropic) when I generate an AI plan. I can
            withdraw this consent at any time by deleting my account. See our Privacy
            Policy for details.
          </span>
        </label>
      )}
    </div>
  );
};
