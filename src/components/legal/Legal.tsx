/**
 * Privacy Policy and Terms of Service pages.
 *
 * These are functional placeholders intended to satisfy App Store review and
 * give users a clear summary of how their data is handled. Have a lawyer
 * review the wording before any commercial launch.
 */

import { useRegion } from '@/contexts/RegionContext';

interface LegalProps {
  onBack: () => void;
}

const PAGE_CONTAINER =
  'min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200';
const INNER = 'max-w-3xl mx-auto px-4 sm:px-6 py-12';

const LAST_UPDATED = 'May 2026';

const BackButton = ({ onBack }: { onBack: () => void }) => (
  <button
    onClick={onBack}
    className="text-sm text-gray-400 hover:text-white transition mb-6"
  >
    ← Back
  </button>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-xl font-bold mt-8 mb-3 text-white">{children}</h2>
);

export const PrivacyPolicy = ({ onBack }: LegalProps) => (
  <div className={PAGE_CONTAINER}>
    <div className={INNER}>
      <BackButton onBack={onBack} />
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-white">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {LAST_UPDATED}</p>

      <p className="leading-relaxed">
        Pre-Season ("the app") is built and operated by Muhammad Bashir Mustafa. This
        policy describes what we collect, why, where it lives, and how you control it.
      </p>

      <SectionHeading>What we collect</SectionHeading>
      <ul className="space-y-2 list-disc list-inside text-gray-300">
        <li>
          <span className="text-white">Account info</span> — your email address, managed
          by our authentication provider Clerk.
        </li>
        <li>
          <span className="text-white">Onboarding answers</span> — region, position,
          fitness level, training window, days per week, equipment, injuries, and goal.
        </li>
        <li>
          <span className="text-white">Generated plans</span> — the training plans you
          generate (free or AI) and the timestamp they were started.
        </li>
        <li>
          <span className="text-white">Workout history</span> — which sessions you mark
          complete and when.
        </li>
      </ul>

      <SectionHeading>What we don't collect</SectionHeading>
      <p>
        We do not collect device location, contacts, microphone, camera, health data, or
        any third-party analytics identifiers. The app does not display advertising and
        does not sell or share data with advertisers.
      </p>

      <SectionHeading>Where your data lives</SectionHeading>
      <ul className="space-y-2 list-disc list-inside text-gray-300">
        <li>
          <span className="text-white">Supabase</span> (Postgres, hosted in the
          Canada/US region) — onboarding answers, plans, and workout history.
        </li>
        <li>
          <span className="text-white">Clerk</span> — authentication and your email
          address.
        </li>
        <li>
          <span className="text-white">Anthropic</span> — when you generate an AI plan,
          your onboarding inputs are sent to the Anthropic Claude API to produce the
          plan, then discarded by Anthropic per their data retention policy.
        </li>
        <li>
          <span className="text-white">Stripe</span> — when you purchase the premium
          tier, your payment is handled by Stripe. We never see your card details;
          Stripe stores them on their PCI-compliant infrastructure.
        </li>
      </ul>

      <SectionHeading>How we use it</SectionHeading>
      <p>
        Solely to generate, display, and track your personalized training plan. We do
        not use your data to train machine-learning models. We do not contact you
        outside of strictly transactional sign-up/sign-in flows.
      </p>

      <SectionHeading>Your controls</SectionHeading>
      <ul className="space-y-2 list-disc list-inside text-gray-300">
        <li>
          <span className="text-white">Export</span> — from Settings → Account → Export
          my data, you can download a JSON file of every row tied to your account.
        </li>
        <li>
          <span className="text-white">Delete</span> — from Settings → Account → Delete
          my account, you can permanently remove your account and every row tied to it.
          Deletion is immediate and irreversible.
        </li>
      </ul>

      <SectionHeading>Cookies</SectionHeading>
      <p>
        Clerk sets a small number of essential cookies to keep you signed in. We do not
        use analytics, marketing, or advertising cookies.
      </p>

      <SectionHeading>Children</SectionHeading>
      <p>
        The app is not directed at children under 13. If you are under 13, please do
        not create an account.
      </p>

      <SectionHeading>Contact</SectionHeading>
      <p>
        For privacy questions or to request deletion outside of the in-app flow, email
        muhammadbm.01@gmail.com.
      </p>
    </div>
  </div>
);

export const TermsOfService = ({ onBack }: LegalProps) => {
  const { config } = useRegion();
  return (
  <div className={PAGE_CONTAINER}>
    <div className={INNER}>
      <BackButton onBack={onBack} />
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-white">
        Terms of Service
      </h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {LAST_UPDATED}</p>

      <p className="leading-relaxed">
        These terms govern your use of Pre-Season. By creating an account or generating
        a plan, you agree to them.
      </p>

      <SectionHeading>What the service is</SectionHeading>
      <p>
        Pre-Season generates periodized {config.sportNoun} training plans personalized to your
        inputs. Plans are produced either by a deterministic in-app engine (free) or by
        a server-side call to a large language model (premium). The app helps you
        organize and track training; it is not a substitute for professional coaching,
        medical advice, or supervised strength and conditioning.
      </p>

      <SectionHeading>Health disclaimer</SectionHeading>
      <p>
        Training programs carry risk of injury. You are responsible for ensuring you
        are medically cleared to undertake exercise before starting any plan generated
        by the app. Consult a qualified medical professional if you have any
        pre-existing condition, recent injury, or doubt about your fitness to train. By
        using the app you accept that no warranty of safety, efficacy, or fitness for
        purpose is given.
      </p>

      <SectionHeading>Your responsibilities</SectionHeading>
      <ul className="space-y-2 list-disc list-inside text-gray-300">
        <li>Provide accurate onboarding answers (including injuries) so the plan can be tailored honestly.</li>
        <li>Train within your physical capacity and stop any exercise that causes sharp pain.</li>
        <li>Do not share your account credentials.</li>
        <li>Do not abuse the AI generation feature in ways that would harm the service or other users.</li>
      </ul>

      <SectionHeading>Premium tier</SectionHeading>
      <p>
        The premium tier is a one-off payment per season, priced by season length
        (from {config.currencyCode} {config.premiumFromPrice}). It unlocks unlimited
        AI-generated plans, using the Anthropic Claude API, for the length of that
        season; once the season elapses a new purchase is required. Payment is
        processed by Stripe; we do not store your card details. Access is granted
        immediately upon purchase. Because this is a digital service delivered
        immediately, the right of withdrawal does not apply once you have generated a
        plan within the season; refund requests for technical failures will be
        considered case-by-case via email.
      </p>

      <SectionHeading>Account termination</SectionHeading>
      <p>
        You may delete your account at any time from Settings → Account. We may suspend
        accounts that abuse the service (e.g., generating plans at industrial volume,
        attempting to reverse-engineer the API key, or signing up with fraudulent
        credentials).
      </p>

      <SectionHeading>Liability</SectionHeading>
      <p>
        The app is provided "as is" without warranty of any kind. To the maximum extent
        permitted by law, the operator is not liable for injury, loss, or damage
        arising from use of the app or from following any plan generated by it.
      </p>

      <SectionHeading>Changes to these terms</SectionHeading>
      <p>
        We may update these terms when material features change. Continued use of the
        app after an update constitutes acceptance of the revised terms.
      </p>

      <SectionHeading>Contact</SectionHeading>
      <p>
        Questions or disputes: muhammadbm.01@gmail.com.
      </p>
    </div>
  </div>
  );
};
