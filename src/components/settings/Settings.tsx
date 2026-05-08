import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isPremium, setPremium } from '@/lib/premium';
import {
  OnboardingData,
  REGIONS,
  FOOTBALL_POSITIONS,
  FITNESS_LEVELS,
  WEEKS_OPTIONS,
  EQUIPMENT_OPTIONS,
  INJURY_OPTIONS,
  GOAL_OPTIONS,
} from '@/types/onboarding';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { saveUserPreferences } from '@/lib/database';
import { Step0_Region } from '@/components/onboarding/Step0_Region';
import { Step1_Position } from '@/components/onboarding/Step1_Position';
import { Step2_FitnessLevel } from '@/components/onboarding/Step2_FitnessLevel';
import { Step3_TrainingWindow } from '@/components/onboarding/Step3_TrainingWindow';
import { Step4_Availability } from '@/components/onboarding/Step4_Availability';
import { Step5_Equipment } from '@/components/onboarding/Step5_Equipment';
import { Step6_Injuries } from '@/components/onboarding/Step6_Injuries';
import { Step7_Goal } from '@/components/onboarding/Step7_Goal';

interface SettingsProps {
  initialData: OnboardingData;
  onSaved: (updated: OnboardingData) => void;
  onCancel: () => void;
}

type SectionKey =
  | 'region'
  | 'position'
  | 'fitness'
  | 'weeks'
  | 'days'
  | 'equipment'
  | 'injury'
  | 'goal';

export const Settings = ({ initialData, onSaved, onCancel }: SettingsProps) => {
  const { user } = useUser();
  const toast = useToast();

  const [draft, setDraft] = useState<OnboardingData>(initialData);
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [premiumOn, setPremiumOn] = useState<boolean>(() => isPremium());

  const togglePremium = () => {
    const next = !premiumOn;
    setPremium(next);
    setPremiumOn(next);
    toast.success(next ? 'Premium dev access enabled' : 'Premium dev access disabled');
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(initialData);

  const handleSave = async () => {
    if (!user) {
      toast.error('You need to be signed in to save changes.');
      return;
    }

    setSaving(true);
    try {
      await saveUserPreferences(
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        draft
      );
      toast.success('Preferences updated');
      onSaved(draft);
    } catch (err) {
      console.error('Failed to save preferences', err);
      toast.error('Could not save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (key: SectionKey) =>
    setOpenSection((prev) => (prev === key ? null : key));

  const regionLabel = REGIONS.find((r) => r.value === draft.region)?.label;
  const positionLabel = FOOTBALL_POSITIONS.find((p) => p.value === draft.position)?.label;
  const fitnessLabel = FITNESS_LEVELS.find((f) => f.value === draft.fitnessLevel)?.label;
  const weeksLabel = WEEKS_OPTIONS.find((w) => w.value === draft.weeksAvailable)?.label;
  const daysLabel = `${draft.daysPerWeek} per week`;
  const equipmentLabel =
    draft.equipment.length === 0
      ? 'None selected'
      : draft.equipment
          .map((e) => EQUIPMENT_OPTIONS.find((eo) => eo.value === e)?.label)
          .filter(Boolean)
          .join(', ');
  const injuryLabel = INJURY_OPTIONS.find((i) => i.value === draft.injury)?.label;
  const goalLabel = GOAL_OPTIONS.find((g) => g.value === draft.goal)?.label;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2"
        >
          Settings
        </motion.h1>
        <p className="text-gray-400">
          Update your preferences. Changes apply when you generate a new plan.
        </p>
      </div>

      <div className="space-y-3">
        <Section
          label="Region"
          value={regionLabel}
          isOpen={openSection === 'region'}
          onToggle={() => toggleSection('region')}
        >
          <Step0_Region
            selected={draft.region}
            onSelect={(region) => setDraft({ ...draft, region })}
          />
        </Section>

        <Section
          label="Position"
          value={positionLabel}
          isOpen={openSection === 'position'}
          onToggle={() => toggleSection('position')}
        >
          <Step1_Position
            selected={draft.position ?? null}
            onSelect={(position) => setDraft({ ...draft, position })}
          />
        </Section>

        <Section
          label="Fitness level"
          value={fitnessLabel}
          isOpen={openSection === 'fitness'}
          onToggle={() => toggleSection('fitness')}
        >
          <Step2_FitnessLevel
            selected={draft.fitnessLevel}
            onSelect={(fitnessLevel) => setDraft({ ...draft, fitnessLevel })}
          />
        </Section>

        <Section
          label="Training window"
          value={weeksLabel}
          isOpen={openSection === 'weeks'}
          onToggle={() => toggleSection('weeks')}
        >
          <Step3_TrainingWindow
            selected={draft.weeksAvailable}
            onSelect={(weeksAvailable) => setDraft({ ...draft, weeksAvailable })}
          />
        </Section>

        <Section
          label="Availability"
          value={daysLabel}
          isOpen={openSection === 'days'}
          onToggle={() => toggleSection('days')}
        >
          <Step4_Availability
            selected={draft.daysPerWeek}
            onSelect={(daysPerWeek) => setDraft({ ...draft, daysPerWeek })}
          />
        </Section>

        <Section
          label="Equipment"
          value={equipmentLabel}
          isOpen={openSection === 'equipment'}
          onToggle={() => toggleSection('equipment')}
        >
          <Step5_Equipment
            selected={draft.equipment}
            onSelect={(eq) =>
              setDraft({ ...draft, equipment: [...draft.equipment, eq] })
            }
            onDeselect={(eq) =>
              setDraft({
                ...draft,
                equipment: draft.equipment.filter((e) => e !== eq),
              })
            }
          />
        </Section>

        <Section
          label="Injuries"
          value={
            draft.injury === 'other' && draft.injuryDetails
              ? `${injuryLabel} — ${draft.injuryDetails}`
              : injuryLabel
          }
          isOpen={openSection === 'injury'}
          onToggle={() => toggleSection('injury')}
        >
          <Step6_Injuries
            selected={draft.injury}
            injuryDetails={draft.injuryDetails || ''}
            onSelect={(injury) => setDraft({ ...draft, injury })}
            onDetailsChange={(injuryDetails) => setDraft({ ...draft, injuryDetails })}
          />
        </Section>

        <Section
          label="Primary goal"
          value={goalLabel}
          isOpen={openSection === 'goal'}
          onToggle={() => toggleSection('goal')}
        >
          <Step7_Goal
            selected={draft.goal}
            onSelect={(goal) => setDraft({ ...draft, goal })}
          />
        </Section>
      </div>

      {/* Developer panel — flip the premium gate locally for dev/testing. */}
      <div className="mt-8 border border-dashed border-purple-500/30 bg-purple-500/5 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-purple-300 mb-1">
              Developer
            </div>
            <div className="font-medium text-gray-100">Premium dev access</div>
            <div className="text-sm text-gray-400 mt-1">
              Unlocks the AI-generated training plan locally. Stripe checkout
              isn&apos;t wired yet — this flag is your way to test the premium
              path end-to-end.
            </div>
          </div>
          <button
            onClick={togglePremium}
            role="switch"
            aria-checked={premiumOn}
            className={[
              'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors',
              premiumOn ? 'bg-emerald-500' : 'bg-gray-700',
            ].join(' ')}
          >
            <motion.span
              layout
              className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow"
              animate={{ x: premiumOn ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 mt-8 -mx-4 px-4 py-4 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent">
        <div className="flex items-center justify-end gap-3 max-w-3xl mx-auto">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            {dirty ? 'Discard changes' : 'Back'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  label: string;
  value?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section = ({ label, value, isOpen, onToggle, children }: SectionProps) => {
  return (
    <div className="border border-gray-800 rounded-2xl bg-gray-900/40 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800/40 transition"
        aria-expanded={isOpen}
      >
        <div className="text-left">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">{label}</div>
          <div className="font-medium text-gray-100">{value ?? '—'}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400">{isOpen ? 'Done' : 'Edit'}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-gray-500"
          >
            ▼
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-800 py-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
