import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

  // Check if email is in the whitelist (admin check)
  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('whitelist')
        .select('email')
        .eq('email', email.toLocaleLowerCase())
        .single(); // Use single() for only one result.

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data !== null;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Login handler
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if email is in the whitelist
      const isWhitelisted = await checkAdminStatus(email);
      console.log('Is Whitelisted:', isWhitelisted);
      if (!isWhitelisted) {
        toast({
          title: 'Access Denied',
          description: 'This email is not authorized for admin access.',
          variant: 'destructive',
        });
        return false;
      }

      // Sign in if email is whitelisted
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Sign-in Error:', signInError); // Log here
      if (signInError) {
        toast({
          title: 'Login Failed',
          description: signInError.message,
          variant: 'destructive',
        });
        return false;
      }

      setIsAdmin(true);
      toast({
        title: 'Login Successful',
        description: 'You are now logged in as an admin.',
      });

      navigate('/admin/dashboard'); // Navigate to the admin dashboard
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during login. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
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

  // Restore session and check if the current user is admin
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;

      if (email) {
        const isWhitelisted = await checkAdminStatus(email);
        if (isWhitelisted) {
          setIsAdmin(true);
        }
      }
    };

    restoreSession();
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
