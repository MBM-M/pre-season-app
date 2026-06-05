import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingData, Region, FootballPosition, FitnessLevel, WeeksAvailable, DaysPerWeek, Equipment, InjuryArea, PrimaryGoal } from '@/types/onboarding';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { useRegion } from '@/contexts/RegionContext';
import { Step1_Position } from './Step1_Position';
import { Step2_FitnessLevel } from './Step2_FitnessLevel';
import { Step3_TrainingWindow } from './Step3_TrainingWindow';
import { Step4_Availability } from './Step4_Availability';
import { Step5_Equipment } from './Step5_Equipment';
import { Step6_Injuries } from './Step6_Injuries';
import { Step7_Goal } from './Step7_Goal';

// Region is no longer asked here — it's auto-detected (and overridable in
// Settings). These are the seven questions that actually shape the plan.
const STEPS = [
  'Position',
  'Fitness',
  'Timeline',
  'Availability',
  'Equipment',
  'Injuries',
  'Goal',
];

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSignIn: () => void;
  isSignedIn: boolean;
}

export const Onboarding = ({ onComplete, onSignIn, isSignedIn }: OnboardingProps) => {
  const { region: detectedRegion } = useRegion();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const [formData, setFormData] = useState<{
    region: Region;
    position?: FootballPosition;
    fitnessLevel?: FitnessLevel;
    weeksAvailable?: WeeksAvailable;
    daysPerWeek?: DaysPerWeek;
    equipment: Equipment[];
    injury: InjuryArea;
    injuryDetails?: string;
    healthConsent: boolean;
    goal?: PrimaryGoal;
  }>({
    // Seeded from auto-detection; the user can correct it later in Settings.
    region: detectedRegion,
    equipment: [],
    injury: 'none',
    healthConsent: false,
  });

  const canGoNext = () => {
    switch (currentStep) {
      case 0: return !!formData.position;
      case 1: return !!formData.fitnessLevel;
      case 2: return !!formData.weeksAvailable;
      case 3: return !!formData.daysPerWeek;
      case 4: return formData.equipment.length > 0;
      case 5: return !!formData.injury && formData.healthConsent;
      case 6: return !!formData.goal;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canGoNext()) {
      if (currentStep === STEPS.length - 1) {
        onComplete(formData as OnboardingData);
      } else {
        setDirection(1);
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1_Position
            selected={formData.position || null}
            onSelect={(position) => setFormData({ ...formData, position })}
          />
        );
      case 1:
        return (
          <Step2_FitnessLevel
            selected={formData.fitnessLevel ?? null}
            onSelect={(fitnessLevel) => setFormData({ ...formData, fitnessLevel })}
          />
        );
      case 2:
        return (
          <Step3_TrainingWindow
            selected={formData.weeksAvailable ?? null}
            onSelect={(weeksAvailable) => setFormData({ ...formData, weeksAvailable })}
          />
        );
      case 3:
        return (
          <Step4_Availability
            selected={formData.daysPerWeek ?? null}
            onSelect={(daysPerWeek) => setFormData({ ...formData, daysPerWeek })}
          />
        );
      case 4:
        return (
          <Step5_Equipment
            selected={formData.equipment}
            onSelect={(eq) => setFormData({ ...formData, equipment: [...formData.equipment, eq] })}
            onDeselect={(eq) => setFormData({ ...formData, equipment: formData.equipment.filter(e => e !== eq) })}
          />
        );
      case 5:
        return (
          <Step6_Injuries
            selected={formData.injury}
            injuryDetails={formData.injuryDetails || ''}
            consent={formData.healthConsent}
            onSelect={(injury) => setFormData({ ...formData, injury })}
            onDetailsChange={(details) => setFormData({ ...formData, injuryDetails: details })}
            onConsentChange={(healthConsent) => setFormData({ ...formData, healthConsent })}
          />
        );
      case 6:
        return (
          <Step7_Goal
            selected={formData.goal ?? null}
            onSelect={(goal) => setFormData({ ...formData, goal })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Sign In Link */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onSignIn}
            className="text-gray-400 hover:text-white text-sm transition flex items-center gap-2"
          >
            {isSignedIn ? (
              <>
                You're signed in
                <span className="text-emerald-400 font-medium">Go to Dashboard →</span>
              </>
            ) : (
              <>
                Already have an account?
                <span className="text-emerald-400 font-medium">Sign In →</span>
              </>
            )}
          </button>
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-10 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canGoNext()}
          >
            {currentStep === STEPS.length - 1 ? 'Generate Plan' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
