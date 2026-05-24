import { REGIONS, Region } from '@/types/onboarding';
import { SelectableOption } from '@/components/ui/OptionCard';

interface Step0RegionProps {
  selected: Region;
  onSelect: (region: Region) => void;
}

export const Step0_Region = ({ selected, onSelect }: Step0RegionProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Where are you based?</h1>
        <p className="text-gray-400">
          We set this automatically from your device. Change it if it's wrong — it
          controls your currency and whether we say football or soccer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {REGIONS.map((region) => (
          <SelectableOption
            key={region.value}
            label={region.label}
            emoji={region.flag}
            selected={selected === region.value}
            onClick={() => onSelect(region.value)}
          />
        ))}
      </div>
    </div>
  );
};
