
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import PrincipalMessage from '@/components/home/PrincipalMessage';
import Testimonials from '@/components/home/Testimonials';
import AnnouncementSection from '@/components/home/AnnouncementSection';
import FeaturedEvents from '@/components/home/FeaturedEvents';

const Index = () => {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <PrincipalMessage />
      <AnnouncementSection />
      <FeaturedEvents />
      <Testimonials />
    </div>
  );
};

export default Index;
