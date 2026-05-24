import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Region } from '@/types/onboarding';
import { detectRegion, getRegionConfig, RegionConfig } from '@/lib/region';

interface RegionContextValue {
  /** The region currently driving currency + terminology across the app. */
  region: Region;
  /** Derived presentation config (currency, sport noun) for `region`. */
  config: RegionConfig;
  /** Override the region (e.g. from the Settings switcher or saved prefs). */
  setRegion: (region: Region) => void;
  /** Re-run auto-detection — used when a user signs out. */
  resetRegion: () => void;
  /** True until something overrides the auto-detected value. */
  autoDetected: boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  // Detect once on first render. This runs before the landing page paints, so
  // signed-out visitors already see the right currency/terminology.
  const [region, setRegionState] = useState<Region>(() => detectRegion());
  const [autoDetected, setAutoDetected] = useState(true);

  const setRegion = useCallback((next: Region) => {
    setRegionState(next);
    setAutoDetected(false);
  }, []);

  const resetRegion = useCallback(() => {
    setRegionState(detectRegion());
    setAutoDetected(true);
  }, []);

  return (
    <RegionContext.Provider
      value={{
        region,
        config: getRegionConfig(region),
        setRegion,
        resetRegion,
        autoDetected,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return ctx;
}
