import { Region } from '@/types/onboarding';

/**
 * Region detection + per-region presentation config.
 *
 * Detection is intentionally dependency-free: it reads the browser's IANA
 * timezone first (a strong signal of physical location) and falls back to the
 * locale region subtag. No IP lookup, no network call, no API key — which also
 * keeps us honest with the privacy policy line about not collecting location.
 *
 * Anything we can't confidently place falls through to 'other'. The detected
 * value is only a default: users can override it in Settings, and that override
 * is what gets persisted to their preferences.
 */

// ── Timezone allow-lists ─────────────────────────────────────────────────────
// Curated rather than prefix-matched on purpose: matching `America/*` would
// wrongly sweep in Mexico, Brazil, etc. An explicit list keeps misclassification
// near zero at the cost of occasionally falling through to the locale check.

const UK_IRELAND_TZ = new Set<string>([
  'Europe/London',
  'Europe/Belfast',
  'Europe/Dublin',
  'Europe/Isle_of_Man',
  'Europe/Guernsey',
  'Europe/Jersey',
]);

const CANADA_USA_TZ = new Set<string>([
  // United States
  'America/New_York',
  'America/Detroit',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Indiana/Indianapolis',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Tell_City',
  'America/Indiana/Knox',
  'America/Indiana/Vevay',
  'America/Chicago',
  'America/Menominee',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/North_Dakota/Beulah',
  'America/Denver',
  'America/Boise',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',
  'Pacific/Honolulu',
  // Canada
  'America/St_Johns',
  'America/Halifax',
  'America/Glace_Bay',
  'America/Moncton',
  'America/Goose_Bay',
  'America/Toronto',
  'America/Nipigon',
  'America/Thunder_Bay',
  'America/Iqaluit',
  'America/Atikokan',
  'America/Winnipeg',
  'America/Rainy_River',
  'America/Resolute',
  'America/Rankin_Inlet',
  'America/Regina',
  'America/Swift_Current',
  'America/Edmonton',
  'America/Cambridge_Bay',
  'America/Yellowknife',
  'America/Inuvik',
  'America/Creston',
  'America/Dawson_Creek',
  'America/Fort_Nelson',
  'America/Vancouver',
  'America/Whitehorse',
  'America/Dawson',
]);

function regionFromTimezone(tz: string): Region | null {
  if (UK_IRELAND_TZ.has(tz)) return 'uk-ireland';
  if (CANADA_USA_TZ.has(tz)) return 'canada-usa';
  return null;
}

function regionFromLocales(locales: readonly string[]): Region | null {
  for (const locale of locales) {
    // e.g. "en-GB" -> "GB", "fr-CA" -> "CA"
    const country = locale.split('-')[1]?.toUpperCase();
    if (country === 'GB' || country === 'IE') return 'uk-ireland';
    if (country === 'US' || country === 'CA') return 'canada-usa';
  }
  return null;
}

/**
 * Best-effort region detection. Never throws; worst case it returns 'other'.
 */
export function detectRegion(): Region {
  // 1) Timezone — the most reliable physical-location signal available client-side.
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const byTz = regionFromTimezone(tz);
      if (byTz) return byTz;
    }
  } catch {
    // Intl unavailable / blocked — fall through to locale.
  }

  // 2) Locale region subtag.
  if (typeof navigator !== 'undefined') {
    const locales =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [];
    const byLocale = regionFromLocales(locales);
    if (byLocale) return byLocale;
  }

  return 'other';
}

// ── Per-region presentation config ───────────────────────────────────────────

export interface RegionConfig {
  /** ISO 4217 code shown beside the price and used later for Stripe. */
  currencyCode: 'GBP' | 'CAD' | 'USD';
  /** Display string for the free tier, e.g. "$0" / "£0". */
  freePrice: string;
  /** Display string for the premium tier, e.g. "$9" / "£5". */
  premiumPrice: string;
  /** The sport noun in lower case, for mid-sentence use ("a soccer plan"). */
  sportNoun: 'football' | 'soccer';
  /** Capitalized sport noun, for labels and start-of-sentence use. */
  sportNounCap: 'Football' | 'Soccer';
}

/**
 * NOTE: the premium amounts here are presentation placeholders, set roughly at
 * parity (~CAD $9). The amount actually charged gets configured in Stripe when
 * checkout is wired — change these in one place if the headline numbers move.
 */
export const REGION_CONFIG: Record<Region, RegionConfig> = {
  'uk-ireland': {
    currencyCode: 'GBP',
    freePrice: '£0',
    premiumPrice: '£5',
    sportNoun: 'football',
    sportNounCap: 'Football',
  },
  'canada-usa': {
    currencyCode: 'CAD',
    freePrice: '$0',
    premiumPrice: '$9',
    sportNoun: 'soccer',
    sportNounCap: 'Soccer',
  },
  other: {
    currencyCode: 'USD',
    freePrice: '$0',
    premiumPrice: '$9',
    sportNoun: 'football',
    sportNounCap: 'Football',
  },
};

export function getRegionConfig(region: Region): RegionConfig {
  return REGION_CONFIG[region] ?? REGION_CONFIG.other;
}
