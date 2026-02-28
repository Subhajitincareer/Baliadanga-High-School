import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export const GlobalPopup = () => {
    const { settings, loading } = useSiteSettings();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!loading && settings?.popup?.active) {
            // Check if already dismissed in this session
            const dismissed = sessionStorage.getItem('popup_dismissed_v1');
            if (!dismissed) {
                setOpen(true);
            }
        }
    }, [loading, settings]);

    const handleClose = () => {
        setOpen(false);
        sessionStorage.setItem('popup_dismissed_v1', 'true');
    };

    if (!settings?.popup?.active) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                {settings.popup.imageUrl && (
                    <div className="w-full h-48 bg-gray-100">
                        <img 
                            src={settings.popup.imageUrl} 
                            alt="Announcement" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    </div>
                )}
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl md:text-2xl font-bold text-school-primary mb-2">
                            {settings.popup.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-gray-600 whitespace-pre-wrap">
                        {settings.popup.content}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
