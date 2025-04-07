
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type AdminContextType = {
  isAdmin: boolean;
  login: (key: string) => boolean;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  
  // Check if admin is already logged in on component mount
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = (key: string): boolean => {
    if (key === 'bali2025') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      toast({
        title: "Admin Access Granted",
        description: "You have successfully logged in as an administrator.",
      });
      return true;
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin key provided.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin account.",
    });
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
