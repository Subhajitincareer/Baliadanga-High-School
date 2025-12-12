import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const LanguageToggle = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="font-bold border border-school-primary/20"
        >
            {language === 'en' ? 'BN' : 'EN'}
        </Button>
    );
};
