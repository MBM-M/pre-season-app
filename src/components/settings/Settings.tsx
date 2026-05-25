import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  saveUserPreferences,
  exportUserData,
  deleteAccountData,
} from '@/lib/database';
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
  onShowPrivacy?: () => void;
  onShowTerms?: () => void;
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

export const Settings = ({
  initialData,
  onSaved,
  onCancel,
  onShowPrivacy,
  onShowTerms,
}: SettingsProps) => {
  const { user } = useUser();
  const toast = useToast();

  const [draft, setDraft] = useState<OnboardingData>(initialData);
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const data = await exportUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `pre-season-export-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Your data was exported.');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error("Couldn't export your data. Try again or contact support.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      // 1. Wipe Supabase rows first (while we still have a valid Clerk session
      //    that satisfies RLS). The ON DELETE CASCADE on users handles every
      //    dependent table — user_preferences, training_plans, workout_completions.
      await deleteAccountData(user.id);
      // 2. Delete the Clerk auth account. This revokes the current session and
      //    triggers Clerk's listeners; the app's auth effect will drop us back
      //    to the landing page automatically.
      await user.delete();
      // (No further state work needed — Clerk's session change will reset App state.)
    } catch (err) {
      console.error('Account deletion failed:', err);
      toast.error("Couldn't delete your account. Please try again.");
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeleteConfirmText('');
    }
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

      {/* Account section — data export + delete (GDPR + App Store mandate) */}
      <div className="mt-8 border border-gray-800 bg-gray-900/40 rounded-2xl p-5">
        <div className="text-xs font-mono uppercase tracking-wide text-gray-400 mb-3">
          Account
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button variant="ghost" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Preparing…' : 'Export my data'}
          </Button>
          <p className="text-sm text-gray-400 sm:self-center">
            Download every row tied to your account as JSON.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <button
            onClick={() => {
              setDeleteConfirmText('');
              setDeleteConfirmOpen(true);
            }}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/40 hover:bg-red-500/10 transition"
          >
            Delete my account
          </button>
          <p className="text-sm text-gray-400 sm:self-center">
            Permanently deletes your profile, preferences, plans, and history. Can&apos;t be undone.
          </p>
        </div>

        {(onShowPrivacy || onShowTerms) && (
          <div className="mt-5 pt-4 border-t border-gray-800 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
            {onShowPrivacy && (
              <button onClick={onShowPrivacy} className="hover:text-gray-300 transition">
                Privacy Policy
              </button>
            )}
            {onShowTerms && (
              <button onClick={onShowTerms} className="hover:text-gray-300 transition">
                Terms of Service
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => !deleting && setDeleteConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-red-500/40 p-6 pointer-events-auto shadow-2xl">
                <h2 className="font-display text-2xl font-bold mb-2">Delete your account?</h2>
                <p className="text-sm text-gray-400 mb-4">
                  This deletes everything: your profile, onboarding answers, training plans,
                  workout completions, and your sign-in. There is no recovery path.
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  Type <span className="font-mono text-red-300">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white font-mono focus:border-red-500/60 focus:outline-none mb-5"
                  placeholder="DELETE"
                  autoFocus
                  disabled={deleting}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteConfirmOpen(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirmText !== 'DELETE' || deleting}
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {deleting ? 'Deleting…' : 'Delete forever'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
