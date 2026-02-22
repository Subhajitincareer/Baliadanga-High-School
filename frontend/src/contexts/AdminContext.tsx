/**
 * AdminContext.tsx
 *
 * Thin wrapper around AuthContext that provides admin-specific UI behaviour:
 * toast notifications, navigation, and the admin whitelist check.
 *
 * Auth state (user object, token cookie) is managed entirely by AuthContext.
 * No localStorage token reads/writes here.
 */
import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type AdminContextType = {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, adminLogin, logout: authLogout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if email is in the admin whitelist before attempting login
  const checkAdminWhitelist = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/whitelist/${encodeURIComponent(email)}?_t=${Date.now()}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      return !!data?.isAdmin;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Step 1: Whitelist check
    const isWhitelisted = await checkAdminWhitelist(email);
    if (!isWhitelisted) {
      toast({
        title: 'Access Denied',
        description: 'This email is not authorized for admin access.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Step 2: Login via AuthContext (sets httpOnly cookie, returns user obj)
      await adminLogin(email, password);
      toast({
        title: 'Login Successful',
        description: 'You are now logged in as an admin.',
      });
      navigate('/admin/dashboard');
      return true;
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid admin credentials.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authLogout(); // Clears httpOnly cookie + React state via AuthContext
      navigate('/');
      toast({
        title: 'Logged Out',
        description: 'You have been logged out of the admin account.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'An error occurred during logout.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
