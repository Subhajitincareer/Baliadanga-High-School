
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onLogout,
}) => {
  return (
    <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
      <div>
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">{title}</h1>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>
      <Button 
        onClick={onLogout}
        variant="outline"
        className="mt-4 md:mt-0"
      >
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );
};
