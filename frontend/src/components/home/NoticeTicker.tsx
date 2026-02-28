import React from 'react';
import Marquee from 'react-fast-marquee';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export const NoticeTicker = () => {
    const { t } = useLanguage();
    const { settings } = useSiteSettings();

    // Do not show if ticker is inactive or has no messages
    if (!settings?.ticker?.active || !settings?.ticker?.messages?.length) {
        return null;
    }

    return (
        <div className="bg-school-dark text-white text-sm py-2 flex items-center relative z-50">
            <div className="bg-school-secondary px-4 py-1 ml-0 font-bold uppercase tracking-wider absolute left-0 z-10 h-full flex items-center">
                {t('ticker.label')}
            </div>
            <Marquee gradient={false} speed={40} className="pl-24">
                {settings.ticker.messages.map((msg, i) => (
                    <span key={i} className="mx-4">• {msg}</span>
                ))}
            </Marquee>
        </div>
    );
};
