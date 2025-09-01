
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import AnnouncementSection from '@/components/home/AnnouncementSection';
import QuickLinksSection from '@/components/home/QuickLinksSection';
import FeaturedEvents from '@/components/home/FeaturedEvents';

const Index = () => {
  return (
    <div>
      <HeroSection />
      <AnnouncementSection />
      <QuickLinksSection />
      <FeaturedEvents />
      <section className="bg-school-primary py-16 text-white">
        <div className="container text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold">Join the Baliadanga High School Family</h2>
          <p className="mx-auto mb-6 max-w-2xl text-lg">
            We are committed to providing quality education and nurturing the next generation of leaders.
            Contact us today to learn more about admissions and our academic programs.
          </p>
          <div className="mx-auto max-w-md">
            <a href="tel:+919876543210" className="block rounded-md bg-white py-3 text-center text-school-primary transition-colors hover:bg-school-accent">
              Call us: +91 9876543210
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
