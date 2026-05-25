import { useState, useEffect, useCallback } from 'react';
import { useUser, SignIn, SignUp } from '@clerk/clerk-react';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { Landing } from '@/components/landing/Landing';
import { PrivacyPolicy, TermsOfService } from '@/components/legal/Legal';
import { Confirmation } from '@/components/onboarding/Confirmation';
import { ImprovementVision } from '@/components/onboarding/ImprovementVision';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TrainingPlanDisplay } from '@/components/dashboard/TrainingPlan';
import { Settings } from '@/components/settings/Settings';
import { Header, HeaderScreen } from '@/components/layout/Header';
import { OnboardingData } from '@/types/onboarding';
import {
  saveUserPreferences,
  saveTrainingPlan,
  getUserPreferences,
  getLatestPlan,
} from '@/lib/database';
import { generateTrainingPlan, TrainingPlan as GeneratedPlan } from '@/lib/planGenerator';
import { generateAITrainingPlan } from '@/lib/aiPlanGenerator';
import { getActivePassExpiry, claimGeneration, startCheckout } from '@/lib/premium';
import { useToast } from '@/components/ui/Toast';
import { useRegion } from '@/contexts/RegionContext';
import './App.css';

const ONBOARDING_STORAGE_KEY = 'pending_onboarding_data';

type Screen =
  | 'landing'
  | 'onboarding'
  | 'vision'
  | 'signin'
  | 'signup'
  | 'confirmation'
  | 'dashboard'
  | 'training-plan'
  | 'settings'
  | 'privacy'
  | 'terms';

const PAGE_BG = 'min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950';

function App() {
  const { isSignedIn, user, isLoaded } = useUser();
  const toast = useToast();
  const { region, config, setRegion, resetRegion } = useRegion();

  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentPlanStartedAt, setCurrentPlanStartedAt] = useState<string | null>(null);
  const [isCheckingPendingData, setIsCheckingPendingData] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [passExpiry, setPassExpiry] = useState<string | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  const hasPass = !!passExpiry;

  const refreshPass = useCallback(async () => {
    if (!user) return;
    try {
      setPassExpiry(await getActivePassExpiry());
    } catch (err) {
      console.error('Error refreshing AI season pass:', err);
    }
  }, [user]);

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

  // Keep the region context in step with the loaded/edited preferences so
  // currency + terminology reflect the user's saved (or overridden) region
  // rather than only the auto-detected default.
  const savedRegion = onboardingData?.region;
  useEffect(() => {
    if (savedRegion) setRegion(savedRegion);
  }, [savedRegion, setRegion]);

  // Handle the return from Stripe Checkout. success_url / cancel_url carry a
  // ?checkout= flag; we surface a toast, strip the param, and (on success)
  // start polling for the credit to be marked paid by the webhook.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get('checkout');
    if (!outcome) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (outcome === 'success') {
      toast.success('Payment received. Preparing your AI-plan credit…');
      setPendingCheckout(true);
    } else if (outcome === 'cancel') {
      toast.info('Checkout canceled — you have not been charged.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The webhook can lag the redirect by a second or two, so poll a few times
  // until the freshly purchased pass appears, then stop.
  useEffect(() => {
    if (!pendingCheckout || !user) return;
    let active = true;
    let tries = 0;
    const tick = async () => {
      tries += 1;
      let expiry: string | null = null;
      try {
        expiry = await getActivePassExpiry();
      } catch (err) {
        console.error('Error polling AI season pass:', err);
      }
      if (!active) return;
      if (expiry || tries >= 4) {
        setPassExpiry(expiry);
        setPendingCheckout(false);
        if (expiry) toast.success('Your AI season pass is active.');
        return;
      }
      window.setTimeout(tick, 2000);
    };
    void tick();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCheckout, user]);

  // After Clerk loads / signs in, reconcile screen with user state.
  useEffect(() => {
    if (!isLoaded) return;

    // Signed-out: drop back to the public landing if we're on a protected screen.
    if (!isSignedIn) {
      setOnboardingData(null);
      setGeneratedPlan(null);
      setCurrentPlanId(null);
      setCurrentPlanStartedAt(null);
      // Forget any saved-region override and re-detect for the next visitor.
      resetRegion();
      if (
        currentScreen === 'dashboard' ||
        currentScreen === 'training-plan' ||
        currentScreen === 'settings' ||
        currentScreen === 'confirmation'
      ) {
        setCurrentScreen('landing');
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

    // 2) Otherwise, fetch existing preferences (and the latest saved plan, so
    //    a returning user's tracking state is restored on reload).
    setIsCheckingPendingData(true);
    Promise.all([
      getUserPreferences(user.id),
      getLatestPlan(user.id),
      getActivePassExpiry(),
    ])
      .then(([existing, latestPlan, expiry]) => {
        setPassExpiry(expiry);
        if (existing) {
          setOnboardingData(existing);
          // Land on dashboard whenever we just signed in / page loaded with prefs.
          if (
            currentScreen === 'landing' ||
            currentScreen === 'onboarding' ||
            currentScreen === 'signin' ||
            currentScreen === 'signup'
          ) {
            setCurrentScreen('dashboard');
          }
        }
        if (latestPlan) {
          setGeneratedPlan(latestPlan.planData as GeneratedPlan);
          setCurrentPlanId(latestPlan.id);
          setCurrentPlanStartedAt(latestPlan.startedAt);
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

  const handleGeneratePlan = async () => {
    if (!onboardingData || !user) return;
    const plan = generateTrainingPlan(onboardingData);
    setGeneratedPlan(plan);
    setCurrentScreen('training-plan');
    // Auto-save so we have a plan_id to anchor workout-completion tracking.
    // A save failure shouldn't block viewing the plan — surface a soft warning.
    try {
      const saved = await saveTrainingPlan(user.id, plan, false);
      setCurrentPlanId(saved.id);
      setCurrentPlanStartedAt(saved.startedAt);
    } catch (err) {
      console.error('Error auto-saving plan:', err);
      toast.error("Generated plan, but couldn't save it for tracking. Refresh and try again.");
    }
  };

  // Send the user to Stripe Checkout to buy one AI-plan credit.
  const handleBuyPremium = async () => {
    if (!user || isStartingCheckout) return;
    setIsStartingCheckout(true);
    try {
      await startCheckout(
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        region
      );
      // startCheckout redirects on success; nothing runs after this on success.
    } catch (err) {
      console.error('Error starting checkout:', err);
      toast.error('Could not start checkout. Please try again.');
      setIsStartingCheckout(false);
    }
  };

  const handleGenerateAIPlan = async () => {
    if (!onboardingData || isGeneratingAI) return;
    // No active pass → route to purchase instead of generating.
    if (!hasPass) {
      void handleBuyPremium();
      return;
    }
    setIsGeneratingAI(true);
    toast.info('Generating your AI plan — this can take 10–20 seconds.');
    try {
      // The RPC returns a token the function requires; the pass allows
      // unlimited generations while active, so nothing is spent here.
      const token = await claimGeneration();
      const plan = await generateAITrainingPlan(onboardingData, token);
      setGeneratedPlan(plan);
      setCurrentScreen('training-plan');
      if (user) {
        try {
          const saved = await saveTrainingPlan(user.id, plan, true);
          setCurrentPlanId(saved.id);
          setCurrentPlanStartedAt(saved.startedAt);
        } catch (saveErr) {
          console.error('Error auto-saving AI plan:', saveErr);
          toast.error("Generated plan, but couldn't save it for tracking. Refresh and try again.");
        }
      }
    } catch (err) {
      console.error('Error generating AI plan:', err);
      const raw = err instanceof Error ? err.message : 'Failed to generate AI plan.';
      const msg = raw.includes('no_active_pass')
        ? 'Your AI season pass has expired. Buy a new one to keep generating.'
        : raw;
      toast.error(msg);
      // Pass may have lapsed; re-check so the button reflects reality.
      await refreshPass();
    } finally {
      setIsGeneratingAI(false);
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
    if (screen === 'training-plan' && !generatedPlan && onboardingData) {
      // No plan loaded yet — generate and auto-save in one shot.
      void handleGeneratePlan();
      return;
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

  // ---------- Public landing page ----------
  if (currentScreen === 'landing') {
    return (
      <Landing
        onGetStarted={() => setCurrentScreen('onboarding')}
        onSignIn={() => setCurrentScreen('signin')}
        onShowPrivacy={() => setCurrentScreen('privacy')}
        onShowTerms={() => setCurrentScreen('terms')}
      />
    );
  }

  // ---------- Legal pages (publicly reachable) ----------
  if (currentScreen === 'privacy') {
    return (
      <PrivacyPolicy
        onBack={() => setCurrentScreen(isSignedIn ? 'settings' : 'landing')}
      />
    );
  }
  if (currentScreen === 'terms') {
    return (
      <TermsOfService
        onBack={() => setCurrentScreen(isSignedIn ? 'settings' : 'landing')}
      />
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
            hasPass={hasPass}
            passExpiry={passExpiry}
            premiumPrice={config.seasonPrices[onboardingData.weeksAvailable]}
            onBuyPremium={handleBuyPremium}
            isStartingCheckout={isStartingCheckout}
            planId={currentPlanId}
            plan={generatedPlan}
            planStartedAt={currentPlanStartedAt}
            onViewPlan={() => setCurrentScreen('training-plan')}
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
          <TrainingPlanDisplay
            plan={generatedPlan}
            planId={currentPlanId}
            clerkUserId={user.id}
          />
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
            // Settings changed — drop the cached plan so it re-generates from
            // the new prefs (and re-saves) next time the user views it.
            setGeneratedPlan(null);
            setCurrentPlanId(null);
            setCurrentPlanStartedAt(null);
            setCurrentScreen('dashboard');
          }}
          onCancel={() => setCurrentScreen('dashboard')}
          onShowPrivacy={() => setCurrentScreen('privacy')}
          onShowTerms={() => setCurrentScreen('terms')}
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
