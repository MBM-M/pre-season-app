import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 4000) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    []
  );

  const value: ToastContextValue = {
    showToast,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return ctx;
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: number) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const styles: Record<ToastVariant, { bg: string; border: string; icon: string; iconColor: string }> = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      icon: '✓',
      iconColor: 'text-emerald-400',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/40',
      icon: '✕',
      iconColor: 'text-red-400',
    },
    info: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/40',
      icon: 'ℹ',
      iconColor: 'text-cyan-400',
    },
  };

  const s = styles[toast.variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`pointer-events-auto min-w-[280px] max-w-md rounded-xl border ${s.border} ${s.bg} backdrop-blur-md shadow-lg shadow-black/30 px-4 py-3 flex items-start gap-3`}
    >
      <span className={`text-xl font-bold ${s.iconColor} mt-0.5`}>{s.icon}</span>
      <span className="flex-1 text-sm text-gray-100 leading-relaxed">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-500 hover:text-gray-200 transition text-sm leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  );
};
