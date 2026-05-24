import { EQUIPMENT_OPTIONS, Equipment } from '@/types/onboarding';
import { OptionCard } from '@/components/ui/OptionCard';
import { EducationCard } from '@/components/ui/EducationCard';
import { useRegion } from '@/contexts/RegionContext';

interface Step5EquipmentProps {
  selected: Equipment[];
  onSelect: (equipment: Equipment) => void;
  onDeselect: (equipment: Equipment) => void;
}

export const Step5_Equipment = ({ selected, onSelect, onDeselect }: Step5EquipmentProps) => {
  const { config } = useRegion();
  const toggleSelection = (equipment: Equipment) => {
    if (selected.includes(equipment)) {
      onDeselect(equipment);
    } else {
      onSelect(equipment);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">What do you have access to?</h1>
        <p className="text-gray-400">Select all that apply — we'll adapt your plan accordingly</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {EQUIPMENT_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            selected={selected.includes(option.value)}
            onClick={() => toggleSelection(option.value)}
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-4xl">{option.emoji}</span>
              <span className="font-semibold text-center">{option.label}</span>
            </div>
          </OptionCard>
        ))}
      </div>

      {selected.length === 0 && (
        <p className="text-center text-amber-500 mt-6 text-sm">Please select at least one option</p>
      )}

      <EducationCard
        title="You can get great results anywhere!"
        icon="🏆"
        content={`Research proves you don't need expensive equipment to get in game shape. Studies on ${config.sportNoun}-specific training show that bodyweight exercises in open fields can improve sprint speed by 8-12% and agility by 15% over 8 weeks. Resistance bands are particularly effective for functional strength, matching gym machines for many ${config.sportNoun}-specific movements. Even with just a ball and a field, you can develop elite-level technical skills and cardiovascular fitness.`}
        source="Sports Medicine Open, 2021; Journal of Human Kinetics, 2020; International Journal of Sports Physiology, 2022"
      />
    </div>
  );
};
