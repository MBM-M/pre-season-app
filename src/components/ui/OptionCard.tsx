import { motion } from 'framer-motion';

interface OptionCardProps {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const OptionCard = ({ selected = false, onClick, children, disabled = false, className = '' }: OptionCardProps) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-6 rounded-2xl border-2 transition-all duration-200 text-left
        ${selected
          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
          : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.button>
  );
};

interface SportCardProps {
  label: string;
  emoji: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const SportCard = ({ label, emoji, selected = false, onClick, disabled = false, comingSoon = false }: SportCardProps) => {
  return (
    <OptionCard selected={selected} onClick={onClick} disabled={disabled}>
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl">{emoji}</span>
        <span className="text-lg font-semibold">{label}</span>
        {comingSoon && <span className="text-xs text-gray-500">Coming Soon</span>}
      </div>
    </OptionCard>
  );
};

interface SelectableOptionProps {
  label: string;
  description?: string;
  selected?: boolean;
  onClick: () => void;
  emoji?: string;
}

export const SelectableOption = ({ label, description, selected = false, onClick, emoji }: SelectableOptionProps) => {
  return (
    <OptionCard selected={selected} onClick={onClick}>
      <div className="flex items-start gap-4">
        {emoji && <span className="text-3xl">{emoji}</span>}
        <div className="flex-1">
          <div className="font-semibold text-lg">{label}</div>
          {description && <div className="text-gray-400 text-sm mt-1">{description}</div>}
        </div>
      </div>
    </OptionCard>
  );
};
