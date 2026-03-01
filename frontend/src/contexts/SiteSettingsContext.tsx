/**
 * SiteSettingsContext
 * Loads settings from /api/site-settings once and provides them to the whole app.
 * Components can read schoolInfo, theme, contact, footer, map, heroImages, headmaster.
 * Also applies theme CSS variables to :root so the primary/secondary colors work globally.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SiteSettingsData {
  heroImages: { _id?: string; url: string; fileId: string; caption: string }[];
  headmaster: { name: string; designation: string; message: string; photoUrl: string; photoFileId: string };
  schoolInfo: { name: string; tagline: string; established: string; logoUrl: string };
  theme: { primaryColor: string; secondaryColor: string; accentColor: string };
  contact: { phone: string; phoneAlt: string; email: string; emailAlt: string; address: string; officeHours: string };
  footer: { tagline: string; facebook: string; instagram: string; copyright: string };
  map: { embedUrl: string; directionsUrl: string };
  ticker: { active: boolean; messages: string[] };
  popup: { active: boolean; title: string; content: string; imageUrl: string };
  idCard: { signatureUrl: string; signatureFileId: string; address: string };
}

const DEFAULTS: SiteSettingsData = {
  heroImages: [],
  headmaster: { name: '', designation: 'Headmaster', message: '', photoUrl: '', photoFileId: '' },
  schoolInfo: { name: 'Baliadanga High School', tagline: 'Educating and inspiring since 1963', established: '1963', logoUrl: '' },
  theme: { primaryColor: '#1e3a5f', secondaryColor: '#e8b84b', accentColor: '#2563eb' },
  contact: {
    phone: '+91 9876543210', phoneAlt: '',
    email: 'info@baliadangahs.edu', emailAlt: 'admissions@baliadangahs.edu',
    address: 'Baliadanga Rd, P.O. Baliadanga, West Bengal 741152, India',
    officeHours: 'Mon–Fri: 10:00 AM–4:00 PM\nSaturday: 10:00 AM–2:00 PM\nSunday: Closed',
  },
  footer: { tagline: 'Educating and inspiring since 1963', facebook: 'https://facebook.com', instagram: 'https://instagram.com', copyright: '' },
  map: {
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3646.61255906547!2d88.64565342485139!3d23.93876993151946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f94fe5d5509c0b%3A0xe405765716fb9b5f!2sBaliadanga%20High%20School(H.S)%2C%20Baliadanga%2C%20West%20Bengal%20741152!5e0!3m2!1sen!2sin!4v1744342473832!5m2!1sen!2sin',
    directionsUrl: 'https://goo.gl/maps/1GqfRs6RRmEygZxP6',
  },
  ticker: { active: true, messages: ['Admission Open for Class V to IX (2025)'] },
  popup: { active: false, title: 'Important Notice', content: 'Welcome to Baliadanga High School. Please check our latest notifications.', imageUrl: '' },
  idCard: { signatureUrl: '', signatureFileId: '', address: 'Baliadanga, Kaliachak, Malda' },
};

interface SiteSettingsContextType {
  settings: SiteSettingsData;
  loading: boolean;
  refresh: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULTS,
  loading: true,
  refresh: () => {},
});

// ── Apply theme colors to CSS variables ──────────────────────────────────────
function applyTheme(theme: SiteSettingsData['theme']) {
  const root = document.documentElement;

  // These map directly to Tailwind's @theme variables in index.css:
  // --color-school-primary, --color-school-secondary, --color-school-accent
  // Tailwind classes like bg-school-primary, text-school-accent, etc. read from these.
  root.style.setProperty('--color-school-primary',   theme.primaryColor);
  root.style.setProperty('--color-school-secondary', theme.secondaryColor);
  root.style.setProperty('--color-school-accent',    theme.accentColor);

  // Also compute and set a darker shade for hover states (--color-school-dark)
  const darken = (hex: string, pct = 0.15) => {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((n >> 16) - Math.round(((n >> 16)) * pct)));
    const g = Math.max(0, (((n >> 8) & 0xff) - Math.round((((n >> 8) & 0xff)) * pct)));
    const b = Math.max(0, ((n & 0xff) - Math.round(((n & 0xff)) * pct)));
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };
  root.style.setProperty('--color-school-dark', darken(theme.primaryColor, 0.25));
}

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/site-settings`);
      const json = await res.json();
      if (json.success && json.data) {
        const merged: SiteSettingsData = {
          heroImages: json.data.heroImages ?? DEFAULTS.heroImages,
          headmaster: { ...DEFAULTS.headmaster, ...json.data.headmaster },
          schoolInfo: { ...DEFAULTS.schoolInfo, ...json.data.schoolInfo },
          theme:      { ...DEFAULTS.theme,      ...json.data.theme },
          contact:    { ...DEFAULTS.contact,    ...json.data.contact },
          footer:     { ...DEFAULTS.footer,     ...json.data.footer },
          map:        { ...DEFAULTS.map,        ...json.data.map },
          ticker:     { ...DEFAULTS.ticker,     ...json.data.ticker },
          popup:      { ...DEFAULTS.popup,      ...json.data.popup },
          idCard:     { ...DEFAULTS.idCard,     ...json.data.idCard },
        };
        setSettings(merged);
        applyTheme(merged.theme);
      }
    } catch { /* keep defaults on error */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
