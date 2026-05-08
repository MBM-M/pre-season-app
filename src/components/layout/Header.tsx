import { useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

export type HeaderScreen = 'dashboard' | 'training-plan' | 'settings';

interface HeaderProps {
  currentScreen: HeaderScreen;
  onNavigate: (screen: HeaderScreen) => void;
}

const NAV_ITEMS: { screen: HeaderScreen; label: string }[] = [
  { screen: 'dashboard', label: 'Dashboard' },
  { screen: 'training-plan', label: 'Plan' },
  { screen: 'settings', label: 'Settings' },
];

export const Header = ({ currentScreen, onNavigate }: HeaderProps) => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed', err);
      toast.error('Sign out failed. Please try again.');
      setSigningOut(false);
    }
  };

  const initial = user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-gray-950/80 border-b border-gray-800/60">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 group"
        >
          <span className="text-2xl">⚽</span>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-80 transition">
            Pre-Season
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition ${
                  active
                    ? 'text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="header-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 bg-emerald-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/60 transition"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-semibold text-sm">
              {initial}
            </div>
            <span className="hidden sm:inline text-sm text-gray-300 max-w-[160px] truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
            <motion.span
              animate={{ rotate: menuOpen ? 180 : 0 }}
              className="text-xs text-gray-500"
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Click-away overlay */}
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.1 } }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-700 bg-gray-900 shadow-xl shadow-black/40 overflow-hidden z-20"
                  role="menu"
                >
                  {/* Mobile-only nav items */}
                  <div className="md:hidden border-b border-gray-800">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.screen}
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate(item.screen);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${
                          currentScreen === item.screen
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                        role="menuitem"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="hidden md:block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition"
                    role="menuitem"
                  >
                    Edit profile
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    disabled={signingOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                    role="menuitem"
                  >
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
