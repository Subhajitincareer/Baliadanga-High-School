import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'bn';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const translations: Record<string, Record<Language, string>> = {
    // Navigation
    'nav.home': { en: 'Home', bn: 'হোম' },
    'nav.announcements': { en: 'Announcements', bn: 'ঘোষণা' },
    'nav.academics': { en: 'Academics', bn: 'শিক্ষা' },
    'nav.campus': { en: 'Campus Life', bn: 'ক্যাম্পাস' },
    'nav.contact': { en: 'Contact', bn: 'যোগাযোগ' },
    // Hero
    'hero.welcome': { en: 'Welcome to', bn: 'স্বাগতম' },
    'hero.school': { en: 'Baliadanga High School', bn: 'বালিয়াডাঙ্গা হাই স্কুল' },
    'hero.tagline': { en: 'Nurturing minds, building character, and inspiring excellence since 1965', bn: '১৯৬৫ সাল থেকে মেধা ও চরিত্র গঠনে আমরা প্রতিশ্রুতিবদ্ধ' },
    'btn.apply': { en: 'Apply for Admission', bn: 'ভর্তির জন্য আবেদন' },
    'btn.updates': { en: 'Latest Updates', bn: 'সর্বশেষ আপডেট' },
    // Stats
    'stats.students': { en: 'Total Students', bn: 'মোট ছাত্রছাত্রী' },
    'stats.teachers': { en: 'Qualified Staff', bn: 'শিক্ষক ও কর্মী' },
    'stats.founded': { en: 'Founded In', bn: 'স্থাপিত' },
    // Ticker
    'ticker.label': { en: 'Latest News:', bn: 'খবর:' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
