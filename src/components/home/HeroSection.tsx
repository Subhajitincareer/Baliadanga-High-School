
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-school-primary to-school-dark py-16 text-white md:py-24">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            Welcome to Baliadanga High School
          </h1>
          <p className="mb-8 text-lg md:text-xl">
            Nurturing minds, building character, and inspiring excellence since 1965
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/admission">
              <Button className="bg-school-secondary hover:bg-green-700" size="lg">
                Admissions
              </Button>
            </Link>
            <Link to="/announcements">
            <Button 
  variant="outline" 
  className="border-white text-blue-600 hover:bg-blue-100 hover:text-school-primary" 
  size="lg"
>
  Latest Updates
</Button>

            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
