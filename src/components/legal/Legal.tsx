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

const LAST_UPDATED = 'June 2026';

// TODO(legal): confirm your actual province of residence/operation before launch.
// This drives the governing-law clause in the Terms of Service.
const GOVERNING_PROVINCE = 'Ontario';

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
        Pre-Season ("the app") is built and operated by Muhammad Bashir Mustafa, who is
        the data controller for the purposes of UK and EU data protection law. This
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
          plan. Anthropic does not use data submitted through its API to train its
          models, and retains it only briefly for trust-and-safety purposes per its
          commercial data policy.
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

      <SectionHeading>How we protect it</SectionHeading>
      <p>
        All traffic between your device and our services is encrypted in transit over
        HTTPS. Your records are protected by row-level security in the database, so each
        account can only ever read or write its own rows. Authentication and payment
        credentials are handled by Clerk and Stripe respectively and never stored on
        our own servers.
      </p>

      <SectionHeading>How long we keep it</SectionHeading>
      <p>
        We retain your account data for as long as your account exists. When you delete
        your account, every row tied to it is removed immediately, and copies in routine
        encrypted backups age out within 30 days. Anonymous, aggregate counts that
        cannot identify you may be retained.
      </p>

      <SectionHeading>Your rights</SectionHeading>
      <p>
        Depending on where you live (including under UK GDPR, EU GDPR, and Canada's
        PIPEDA), you have the right to access, correct, export, and delete your personal
        data, to object to or restrict certain processing, and to withdraw consent at
        any time. The in-app Export and Delete tools cover access, portability, and
        erasure directly; for anything else, email us. Our legal bases for processing
        are the performance of our contract with you (providing the plans you request)
        and your consent (for optional features such as AI generation). If you are in
        the UK or EU and believe we have mishandled your data, you may also complain to
        your local supervisory authority (in the UK, the Information Commissioner's
        Office).
      </p>

      <SectionHeading>International data transfers</SectionHeading>
      <p>
        Your data is stored on Supabase infrastructure in the Canada/US region, and
        processed by Clerk, Stripe, and Anthropic, which may operate in the United
        States. If you access the app from the UK, EU, or elsewhere, your data is
        transferred internationally. Where required, these transfers rely on appropriate
        safeguards such as adequacy decisions or standard contractual clauses offered by
        the relevant providers.
      </p>

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
        preseason.app.help@gmail.com.
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
        immediately upon purchase. Where you have a statutory cooling-off right for
        digital content (for example as a consumer in the UK or EU), you expressly
        request that access begin immediately and acknowledge that you lose that right
        once you generate a plan within the season. Refund requests for technical
        failures will be considered case-by-case via email.
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

      <SectionHeading>Governing law</SectionHeading>
      <p>
        These terms are governed by the laws of the Province of {GOVERNING_PROVINCE} and
        the federal laws of Canada applicable therein, without regard to conflict-of-law
        rules. The courts located in {GOVERNING_PROVINCE} have jurisdiction over any
        dispute, except where mandatory consumer-protection laws in your country of
        residence give you the right to bring proceedings locally.
      </p>

      <SectionHeading>Changes to these terms</SectionHeading>
      <p>
        We may update these terms when material features change. Continued use of the
        app after an update constitutes acceptance of the revised terms.
      </p>

      <SectionHeading>Contact</SectionHeading>
      <p>
        Questions or disputes: preseason.app.help@gmail.com.
      </p>
    </div>
  </div>
  );
};
