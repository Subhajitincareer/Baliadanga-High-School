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
    'nav.midmeal': { en: 'Mid-Day Meal', bn: 'মিড-ডে মিল' },
    'nav.admin': { en: 'Admin', bn: 'অ্যাডমিন' },
    
    // Sub-menus
    'nav.sub.courses': { en: 'Courses', bn: 'কোর্সসমূহ' },
    'nav.sub.courses.desc': { en: 'Explore our comprehensive academic curriculum', bn: 'আমাদের বিস্তৃত একাডেমিক পাঠ্যক্রম অন্বেষণ করুন' },
    'nav.sub.calendar': { en: 'Academic Calendar', bn: 'একাডেমিক ক্যালেন্ডার' },
    'nav.sub.calendar.desc': { en: 'View important academic dates and events', bn: 'গুরুত্বপূর্ণ একাডেমিক তারিখ এবং ইভেন্টগুলি দেখুন' },
    'nav.sub.resources': { en: 'Resources', bn: 'রিসোর্স' },
    'nav.sub.resources.desc': { en: 'Access learning materials and educational resources', bn: 'শেখার উপকরণ এবং শিক্ষামূলক সংস্থান অ্যাক্সেস করুন' },
    'nav.sub.routine': { en: 'Class Routine', bn: 'ক্লাস রুটিন' },
    'nav.sub.routine.desc': { en: 'View weekly class timetables and schedules', bn: 'সাপ্তাহিক ক্লাসের সময়সূচী দেখুন' },
    
    'nav.sub.events': { en: 'Events', bn: 'ইভেন্ট' },
    'nav.sub.events.desc': { en: 'Stay updated with school events and activities', bn: 'স্কুলের ইভেন্ট এবং কার্যকলাপের সাথে আপডেট থাকুন' },
    'nav.sub.gallery': { en: 'Gallery', bn: 'গ্যালারি' },
    'nav.sub.gallery.desc': { en: 'Browse photos of our school and events', bn: 'আমাদের স্কুল এবং ইভেন্টের ছবি ব্রাউজ করুন' },
    'nav.sub.staff': { en: 'Staff', bn: 'কর্মকর্তা ও কর্মচারী' },
    'nav.sub.staff.desc': { en: 'Meet our dedicated teachers and staff members', bn: 'আমাদের নিবেদিতপ্রাণ শিক্ষক এবং কর্মীদের সাথে দেখা করুন' },

    // Hero
    'hero.welcome': { en: 'Welcome to', bn: 'স্বাগতম' },
    'hero.school': { en: 'Baliadanga High School', bn: 'বালিয়াডাঙ্গা হাই স্কুল' },
    'hero.tagline': { en: 'Nurturing minds, building character, and inspiring excellence since 1965', bn: '১৯৬৫ সাল থেকে মেধা ও চরিত্র গঠনে আমরা প্রতিশ্রুতিবদ্ধ' },
    'btn.apply': { en: 'Apply for Admission', bn: 'ভর্তির জন্য আবেদন' },
    'btn.updates': { en: 'Latest Updates', bn: 'সর্বশেষ আপডেট' },
    'btn.studentPortal': { en: 'Student Portal', bn: 'ছাত্র পোর্টাল' },
    'btn.adminPortal': { en: 'Admin Portal', bn: 'অ্যাডমিন পোর্টাল' },

    // Stats
    'stats.students': { en: 'Total Students', bn: 'মোট ছাত্রছাত্রী' },
    'stats.teachers': { en: 'Qualified Staff', bn: 'শিক্ষক ও কর্মী' },
    'stats.founded': { en: 'Founded In', bn: 'স্থাপিত' },
    
    // Ticker
    'ticker.label': { en: 'Latest News:', bn: 'খবর:' },

    // Headmaster
    'hm.title': { en: 'Headmaster\'s Message', bn: 'প্রধান শিক্ষকের বার্তা' },
    'hm.readmore': { en: 'Read More', bn: 'আরও পড়ুন' },

    // Contact Page
    'contact.title': { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
    'contact.subtitle': { en: 'Get in touch with us for any inquiries or information.', bn: 'যেকোনো জিজ্ঞাসা বা তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।' },
    'contact.info': { en: 'Contact Information', bn: 'যোগাযোগের তথ্য' },
    'contact.address': { en: 'Address', bn: 'ঠিকানা' },
    'contact.phone': { en: 'Phone', bn: 'ফোন' },
    'contact.email': { en: 'Email', bn: 'ইমেইল' },
    'contact.officeHours': { en: 'Office Hours', bn: 'অফিসের সময়' },
    'contact.sendMessage': { en: 'Send us a Message', bn: 'আমাদের বার্তা পাঠান' },
    'contact.form.name': { en: 'Your Name', bn: 'আপনার নাম' },
    'contact.form.email': { en: 'Your Email', bn: 'আপনার ইমেইল' },
    'contact.form.subject': { en: 'Subject', bn: 'বিষয়' },
    'contact.form.message': { en: 'Message', bn: 'বার্তা' },
    'contact.form.submit': { en: 'Send Message', bn: 'বার্তা পাঠান' },

    // Footer
    'footer.quickLinks': { en: 'Quick Links', bn: 'গুরুত্বপূর্ণ লিংক' },
    'footer.connect': { en: 'Connect With Us', bn: 'আমাদের সাথে যুক্ত হন' },
    'footer.developedBy': { en: 'Developed by Subhajit', bn: 'উন্নয়নে শুভজিৎ' },
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
