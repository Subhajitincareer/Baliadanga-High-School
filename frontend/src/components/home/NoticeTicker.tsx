import React from 'react';
import Marquee from 'react-fast-marquee';
import { useLanguage } from '@/contexts/LanguageContext';

export const NoticeTicker = () => {
    const { t } = useLanguage();

    return (
        <div className="bg-school-dark text-white text-sm py-2 flex items-center relative z-50">
            <div className="bg-school-secondary px-4 py-1 ml-0 font-bold uppercase tracking-wider absolute left-0 z-10 h-full flex items-center">
                {t('ticker.label')}
            </div>
            <Marquee gradient={false} speed={40} className="pl-24">
                <span className="mx-4">• Admission Open for Class V to IX (2025)</span>
                <span className="mx-4">• School will remain closed tomorrow due to heavy rainfall.</span>
                <span className="mx-4">• Annual Sports Day scheduled for Dec 20, 2024.</span>
                <span className="mx-4">• Result of Half-Yearly Exam published. Check Portal.</span>
            </Marquee>
        </div>
    );
};
