export type Lang = 'en' | 'te' | 'hi';

type Dict = Record<string, { en: string; te: string }>;

const dict: Dict = {
  appName: { en: 'NEXGEN', te: 'నెక్స్‌జెన్' },
  tagline: { en: 'Your Local Service Expert', te: 'మీ స్థానిక సేవా నిపుణుడు' },
  login: { en: 'Login', te: 'లాగిన్' },
  getOtp: { en: 'Get OTP', te: 'OTP పంపు' },
  verifyLogin: { en: 'Verify & Login', te: 'ధృవీకరించి లాగిన్' },
  continue: { en: 'Continue', te: 'కొనసాగించు' },
  chooseLanguage: { en: 'Choose Language', te: 'భాష ఎంచుకోండి' },
  home: { en: 'Home', te: 'హోమ్' },
  bookings: { en: 'Booking', te: 'బుకింగ్' },
  shop: { en: 'Shop', te: 'షాప్' },
  profile: { en: 'Profile', te: 'ప్రొఫైల్' },
  searchPlaceholder: {
    en: "Search for 'Fan Repair' or 'Plumber'...",
    te: 'వెతకండి...',
  },
  topRated: { en: 'Top Rated Near You', te: 'మీ దగ్గర టాప్ రేటెడ్' },
  chooseService: { en: 'Choose a Service', te: 'సేవ ఎంచుకోండి' },
  expertsIn: { en: 'Showing 25+ Experts in Rajahmundry.', te: 'రాజమండ్రిలో 25+ నిపుణులు.' },
};

export function t(lang: Lang, key: keyof typeof dict): string {
  const row = dict[key];
  if (!row) return key;
  if (lang === 'hi') return row.en;
  return row[lang] ?? row.en;
}
