import React from 'react';
import { Home, Bell, Phone, UserCircle, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';

export const PublicMobileNav = () => {
    const location = useLocation();
    const { t } = useLanguage();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden safe-area-bottom">
            <Link to="/" className={cn("flex flex-1 flex-col items-center gap-1 py-1", isActive('/') ? "text-school-primary" : "text-gray-500")}>
                <Home size={20} />
                <span className="text-[10px] font-medium">{t('nav.home')}</span>
            </Link>

            <Link to="/announcements" className={cn("flex flex-1 flex-col items-center gap-1 py-1", isActive('/announcements') ? "text-school-primary" : "text-gray-500")}>
                <Bell size={20} />
                <span className="text-[10px] font-medium">{t('nav.announcements')}</span>
            </Link>

            <div className="flex -mt-8 justify-center">
                <Link to="/admission" className="flex h-14 w-14 items-center justify-center rounded-full bg-school-secondary text-white shadow-lg ring-4 ring-white">
                    <span className="text-2xl font-bold">+</span>
                </Link>
            </div>

            <Link to="/contact" className={cn("flex flex-1 flex-col items-center gap-1 py-1", isActive('/contact') ? "text-school-primary" : "text-gray-500")}>
                <Phone size={20} />
                <span className="text-[10px] font-medium">{t('nav.contact')}</span>
            </Link>

            <Link to="/portal" className={cn("flex flex-1 flex-col items-center gap-1 py-1", isActive('/portal') ? "text-school-primary" : "text-gray-500")}>
                <UserCircle size={20} />
                <span className="text-[10px] font-medium">Portal</span>
            </Link>
        </div>
    );
};
