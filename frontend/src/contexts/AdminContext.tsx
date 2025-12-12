import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { useNavigate } from 'react-router-dom';

type AdminContextType = {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Whitelist/admin check (API endpoint or local check)
  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      // Call backend to check if the email exists in admin whitelist
      const result = await apiService.checkAdminWhitelist(email);
      return !!result?.isAdmin; // backend: { isAdmin: true/false }
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Login handler
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check admin whitelist
      const isWhitelisted = await checkAdminStatus(email);
      if (!isWhitelisted) {
        toast({
          title: 'Access Denied',
          description: 'This email is not authorized for admin access.',
          variant: 'destructive',
        });
        return false;
      }

      // Now try login
      const resp = await apiService.adminLogin(email, password);
      if (!resp?.token || !resp?.user) {
        toast({
          title: 'Login Failed',
          description: resp?.message || 'Invalid admin credentials.',
          variant: 'destructive',
        });
        return false;
      }

      // Store tokens/admin info for session
      localStorage.setItem('token', resp.token);
      localStorage.setItem('userRole', resp.user.role || 'admin');
      localStorage.setItem('userId', resp.user._id || resp.user.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      setIsAdmin(true);

      toast({
        title: 'Login Successful',
        description: 'You are now logged in as an admin.'
      });

      navigate('/admin/dashboard');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred during login. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      // Optionally call backend logout endpoint
      await apiService.logout();
      setIsAdmin(false);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      navigate('/');
      toast({
        title: 'Logged Out',
        description: 'You have been logged out of the admin account.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during logout.',
        variant: 'destructive',
      });
    }
  };

  // Restore session from localStorage (on mount/reload)
  useEffect(() => {
    const maybeSession = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      const allowedRoles = ['admin', 'teacher', 'staff', 'principal', 'vice_principal', 'coordinator'];
      if (token && role && allowedRoles.includes(role)) {
        setIsAdmin(true);
      }
    };
    maybeSession();
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
