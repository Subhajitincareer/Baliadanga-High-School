
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NoticeTicker } from '@/components/home/NoticeTicker';
import { FloatingAction } from '@/components/home/FloatingAction';
import { PublicMobileNav } from '@/components/layout/PublicMobileNav';
import { PageTransition } from '@/components/common/PageTransition';

const Layout: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen w-full flex-col bg-white pb-16 md:pb-0"> {/* Added padding bottom for mobile nav */}
        <NoticeTicker />
        <Navbar />
        <main className="flex-grow w-full relative">
          <PageTransition>
            <Outlet />
          </PageTransition>
          <FloatingAction />
        </main>
        <PublicMobileNav />
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Layout;
