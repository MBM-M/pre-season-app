import { motion, AnimatePresence } from 'framer-motion';

interface RegenUpsellModalProps {
  open: boolean;
  /** Display price for the user's season pass, e.g. "£8" / "$15". */
  premiumPrice?: string;
  isStartingCheckout?: boolean;
  /** Buy the season pass (Stripe Checkout). */
  onBuyPass: () => void;
  /** Proceed with regenerating the free plan. */
  onRegenerateFree: () => void;
  onClose: () => void;
}

/**
 * Shown when a free user regenerates their plan — the exact moment the free
 * template stops fitting (schedule changed, too easy, new injury) and the
 * value of unlimited adaptive AI plans is most concrete.
 */
export const RegenUpsellModal = ({
  open,
  premiumPrice,
  isStartingCheckout = false,
  onBuyPass,
  onRegenerateFree,
  onClose,
}: RegenUpsellModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl shadow-emerald-500/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs uppercase tracking-wide font-mono text-emerald-300 mb-3">
            Before you regenerate
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Something changed, right?
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Regenerating the free plan rebuilds the same template from your
            saved answers — and resets your session tracking.
          </p>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 mb-5">
            <p className="text-sm text-gray-200 leading-relaxed">
              The <span className="font-semibold text-emerald-300">AI season pass</span>{' '}
              builds a fresh plan around whatever changed — new schedule, a
              knock, a different goal — as many times as you want, all season.
              One-time{premiumPrice ? `, ${premiumPrice}` : ''}. No subscription.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onBuyPass}
              disabled={isStartingCheckout}
              className="w-full text-base font-semibold bg-gradient-to-br from-emerald-400 to-cyan-500 text-gray-950 px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition disabled:opacity-70"
            >
              {isStartingCheckout
                ? 'Opening checkout…'
                : `✨ Unlock unlimited AI plans${premiumPrice ? ` — ${premiumPrice}` : ''}`}
            </button>
            <button
              onClick={onRegenerateFree}
              className="w-full text-sm text-gray-400 hover:text-white px-5 py-2.5 rounded-xl transition"
            >
              No thanks, regenerate my free plan
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
