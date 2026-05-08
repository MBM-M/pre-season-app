import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface ConfirmationProps {
  onContinue: () => void;
}

export const Confirmation = ({ onContinue }: ConfirmationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      <div className="text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          You're In!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-300 mb-6"
        >
          Your preferences have been saved
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 mb-10 max-w-md mx-auto"
        >
          We've analyzed your responses and are ready to build your personalized pre-season training plan.
        </motion.p>

        {/* Animated Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto"
        >
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-xs text-gray-400 mt-1">Personalized</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-cyan-400">Science</div>
            <div className="text-xs text-gray-400 mt-1">Based</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-purple-400">Pro</div>
            <div className="text-xs text-gray-400 mt-1">Level</div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button variant="primary" onClick={onContinue} className="text-lg px-12 py-4">
            View Your Dashboard →
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
