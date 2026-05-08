import { useState, useEffect, useCallback } from 'react';
import { useUser, SignIn, SignUp } from '@clerk/clerk-react';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { Confirmation } from '@/components/onboarding/Confirmation';
import { ImprovementVision } from '@/components/onboarding/ImprovementVision';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TrainingPlanDisplay } from '@/components/dashboard/TrainingPlan';
import { Settings } from '@/components/settings/Settings';
import { Header, HeaderScreen } from '@/components/layout/Header';
import { OnboardingData } from '@/types/onboarding';
import { saveUserPreferences, saveTrainingPlan, getUserPreferences } from '@/lib/database';
import { generateTrainingPlan, TrainingPlan as GeneratedPlan } from '@/lib/planGenerator';
import { generateAITrainingPlan } from '@/lib/aiPlanGenerator';
import { isPremium } from '@/lib/premium';
import { useToast } from '@/components/ui/Toast';
import './App.css';

const ONBOARDING_STORAGE_KEY = 'pending_onboarding_data';

type Screen =
  | 'onboarding'
  | 'vision'
  | 'signin'
  | 'signup'
  | 'confirmation'
  | 'dashboard'
  | 'training-plan'
  | 'settings';

const PAGE_BG = 'min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950';

function App() {
  const { isSignedIn, user, isLoaded } = useUser();
  const toast = useToast();

  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [isCheckingPendingData, setIsCheckingPendingData] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  /**
   * Persist onboarding data and move to confirmation. Returns true on success.
   * Lifted out of effect/handlers so both sign-up flow and signed-in flow can
   * share the same persistence path.
   */
  const persistOnboarding = useCallback(
    async (data: OnboardingData): Promise<boolean> => {
      if (!user) return false;
      const completeData: OnboardingData = { ...data, sport: 'football' as const };
      try {
        await saveUserPreferences(
          user.id,
          user.primaryEmailAddress?.emailAddress || '',
          completeData
        );
        setOnboardingData(completeData);
        setCurrentScreen('confirmation');
        return true;
      } catch (err) {
        console.error('Error saving preferences:', err);
        toast.error('Failed to save your preferences. Please try again.');
        return false;
      }
    },
    [user, toast]
  );

  // After Clerk loads / signs in, reconcile screen with user state.
  useEffect(() => {
    if (!isLoaded) return;

    // Signed-out: drop back to onboarding if we're on a protected screen.
    if (!isSignedIn) {
      setOnboardingData(null);
      setGeneratedPlan(null);
      if (
        currentScreen === 'dashboard' ||
        currentScreen === 'training-plan' ||
        currentScreen === 'settings' ||
        currentScreen === 'confirmation'
      ) {
        setCurrentScreen('onboarding');
      }
      return;
    }

    // Signed-in: if we already have data loaded, nothing to do.
    if (!user || onboardingData) return;

    // 1) If there's pending onboarding data from a sign-up flow, save it.
    //    Only clear the cache on a successful save — if persistence fails
    //    (e.g. RLS, network), keep the data so the user can retry without
    //    re-filling the 8-step onboarding.
    const pendingRaw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (pendingRaw) {
      let pending: OnboardingData | null = null;
      try {
        pending = JSON.parse(pendingRaw) as OnboardingData;
      } catch (err) {
        console.error('Error parsing pending onboarding data:', err);
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
      if (pending) {
        persistOnboarding(pending).then((ok) => {
          if (ok) localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        });
        return;
      }
    }

    // 2) Otherwise, fetch existing preferences and route accordingly.
    setIsCheckingPendingData(true);
    getUserPreferences(user.id)
      .then((existing) => {
        if (existing) {
          setOnboardingData(existing);
          // Land on dashboard whenever we just signed in / page loaded with prefs.
          if (
            currentScreen === 'onboarding' ||
            currentScreen === 'signin' ||
            currentScreen === 'signup'
          ) {
            setCurrentScreen('dashboard');
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching user preferences:', err);
        toast.error('Could not load your profile. Please try again.');
      })
      .finally(() => setIsCheckingPendingData(false));
    // We deliberately omit `currentScreen` — we only want to react to auth changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    if (!isLoaded) return;
    setOnboardingData(data);
    setCurrentScreen('vision');
  };

  const handleVisionContinue = async () => {
    if (!onboardingData) {
      setCurrentScreen('onboarding');
      return;
    }
    if (!isSignedIn) {
      // Stash and send to sign-up; the auth effect will resume save on completion.
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingData));
      setCurrentScreen('signup');
      return;
    }
    await persistOnboarding(onboardingData);
  };

  const handleGeneratePlan = () => {
    if (!onboardingData) return;
    const plan = generateTrainingPlan(onboardingData);
    setGeneratedPlan(plan);
    setCurrentScreen('training-plan');
  };

  const handleGenerateAIPlan = async () => {
    if (!onboardingData || isGeneratingAI) return;
    if (!isPremium()) {
      toast.info(
        'AI plans are a premium feature. Enable dev access in Settings → Developer to try it.'
      );
      return;
    }
    setIsGeneratingAI(true);
    toast.info('Generating your AI plan — this can take 10–20 seconds.');
    try {
      const plan = await generateAITrainingPlan(onboardingData);
      setGeneratedPlan(plan);
      setCurrentScreen('training-plan');
    } catch (err) {
      console.error('Error generating AI plan:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate AI plan.';
      toast.error(msg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan || !user || !onboardingData) return;
    try {
      await saveTrainingPlan(user.id, generatedPlan, false);
      toast.success('Training plan saved');
    } catch (err) {
      console.error('Error saving plan:', err);
      toast.error('Failed to save plan. Please try again.');
    }
  };

  const handleSignInClick = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setCurrentScreen('signin');
      return;
    }

    // Already signed in — try to load prefs and route to dashboard.
    if (!user) return;
    if (onboardingData) {
      setCurrentScreen('dashboard');
      return;
    }
    setIsCheckingPendingData(true);
    try {
      const existing = await getUserPreferences(user.id);
      if (existing) {
        setOnboardingData(existing);
        setCurrentScreen('dashboard');
      } else {
        toast.info('Finish onboarding to unlock your dashboard.');
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      toast.error('Could not load your profile. Please try again.');
    } finally {
      setIsCheckingPendingData(false);
    }
  };

  const handleHeaderNavigate = (screen: HeaderScreen) => {
    if (screen === 'training-plan') {
      // Generate fresh plan on demand if we don't have one yet.
      if (!generatedPlan && onboardingData) {
        const plan = generateTrainingPlan(onboardingData);
        setGeneratedPlan(plan);
      }
    }
    setCurrentScreen(screen);
  };

  // ---------- Loading ----------
  if (!isLoaded || isCheckingPendingData) {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center`}>
        <div className="text-emerald-400 text-2xl">Loading...</div>
      </div>
    );
  }

  // ---------- Auth screens ----------
  if (currentScreen === 'signin') {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          <SignIn afterSignInUrl={window.location.href} signUpUrl="/sign-up" />
          <button
            onClick={() => setCurrentScreen('onboarding')}
            className="mt-4 w-full text-gray-400 hover:text-white transition"
          >
            ← Back to onboarding
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'signup') {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          <SignUp afterSignUpUrl={window.location.href} signInUrl="/sign-in" />
          <button
            onClick={() => setCurrentScreen('vision')}
            className="mt-4 w-full text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ---------- Vision (improvement projection) ----------
  if (currentScreen === 'vision' && onboardingData) {
    return (
      <div className={`${PAGE_BG} py-10`}>
        <ImprovementVision
          data={onboardingData}
          onContinue={handleVisionContinue}
          onBack={() => setCurrentScreen('onboarding')}
          ctaLabel={isSignedIn ? 'Save & continue →' : 'Create my account →'}
        />
      </div>
    );
  }

  // ---------- Confirmation ----------
  if (currentScreen === 'confirmation' && onboardingData) {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center p-4`}>
        <Confirmation onContinue={() => setCurrentScreen('dashboard')} />
      </div>
    );
  }

  // ---------- Authenticated screens (with header) ----------
  // Guard: protected screens require user + onboarding data. If either is
  // missing, the auth effect resets the screen — meanwhile we just fall
  // through to the onboarding default below to avoid rendering a broken
  // header.

  if (currentScreen === 'dashboard' && user && onboardingData) {
    return (
      <div className={PAGE_BG}>
        <Header currentScreen="dashboard" onNavigate={handleHeaderNavigate} />
        <div className="py-10">
          <Dashboard
            userData={onboardingData}
            email={user.primaryEmailAddress?.emailAddress || ''}
            onGeneratePlan={handleGeneratePlan}
            onGenerateAIPlan={handleGenerateAIPlan}
            isGeneratingAI={isGeneratingAI}
          />
        </div>
      </div>
    );
  }

  if (currentScreen === 'training-plan' && generatedPlan && onboardingData && user) {
    return (
      <div className={PAGE_BG}>
        <Header currentScreen="training-plan" onNavigate={handleHeaderNavigate} />
        <div className="py-10">
          <TrainingPlanDisplay plan={generatedPlan} onSavePlan={handleSavePlan} />
        </div>
      </div>
    );
  }

  if (currentScreen === 'settings' && onboardingData && user) {
    return (
      <div className={PAGE_BG}>
        <Header currentScreen="settings" onNavigate={handleHeaderNavigate} />
        <Settings
          initialData={onboardingData}
          onSaved={(updated) => {
            setOnboardingData(updated);
            // Re-generate plan from new prefs next time it's viewed.
            setGeneratedPlan(null);
            setCurrentScreen('dashboard');
          }}
          onCancel={() => setCurrentScreen('dashboard')}
        />
      </div>
    );
  }

  // ---------- Default: onboarding ----------
  return (
    <Onboarding
      onComplete={handleOnboardingComplete}
      onSignIn={handleSignInClick}
      isSignedIn={!!isSignedIn}
    />
  );
}

export default App;
