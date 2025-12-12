
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NoticeTicker } from '@/components/home/NoticeTicker';
import { FloatingAction } from '@/components/home/FloatingAction';

const Layout: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen w-full flex-col bg-white">
        <NoticeTicker />
        <Navbar />
        <main className="flex-grow w-full relative">
          <Outlet />
          <FloatingAction />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Layout;
