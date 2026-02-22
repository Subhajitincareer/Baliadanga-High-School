/**
 * StaffContext.tsx
 *
 * Thin wrapper around AuthContext for staff-specific UI behaviour:
 * toast notifications, navigation, and permission checks.
 *
 * Auth state (user object, cookie) is managed entirely by AuthContext.
 * No localStorage token reads/writes here.
 */
import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth, AuthUser } from './AuthContext';

type StaffContextType = {
  isStaff: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

const STAFF_ROLES = ['teacher', 'principal', 'vice_principal', 'coordinator', 'staff', 'admin'];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isStaff, user, login: authLogin, logout: authLogout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // authLogin calls POST /api/auth/login; httpOnly cookie set by backend
      const loggedInUser = await authLogin(email, password);

      if (!STAFF_ROLES.includes(loggedInUser.role)) {
        // Logged in but not a staff member — log them out immediately
        await authLogout();
        toast({
          title: 'Access Denied',
          description: 'This portal is for Faculty and Staff only.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${loggedInUser.name || 'Staff Member'}!`,
      });
      navigate('/staff/dashboard');
      return true;
    } catch (error: any) {
      toast({
        title: 'Error Encountered',
        description: error.message || 'An unexpected error occurred during login.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authLogout(); // Clears httpOnly cookie + React state via AuthContext
    } finally {
      navigate('/staff/login');
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
      });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'principal') return true;
    return user.permissions?.includes(permission) || false;
  };

  return (
    <StaffContext.Provider value={{ isStaff, user, login, logout, hasPermission }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) throw new Error('useStaff must be used within a StaffProvider');
  return context;
};
