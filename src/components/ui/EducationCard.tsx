import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EducationCardProps {
  title: string;
  content: string;
  source?: string;
  icon?: string;
}

export const EducationCard = ({ title, content, source, icon = '💡' }: EducationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 w-full"
    >
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/70 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold text-emerald-400">{title}</span>
          </div>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 text-2xl"
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 pt-2">
                <p className="text-gray-300 leading-relaxed mb-3">{content}</p>
                {source && (
                  <p className="text-xs text-gray-500 italic">Source: {source}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
