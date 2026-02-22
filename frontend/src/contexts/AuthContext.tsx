/**
 * AuthContext.tsx
 *
 * Single source of truth for authentication state across all user types
 * (admin, staff, student). Replaces fragmented localStorage token reads.
 *
 * Design:
 * - JWT lives in an httpOnly cookie (set by the backend on login)
 * - On mount, we call GET /api/auth/me with credentials:'include' to rehydrate
 *   the session (handles page refresh without re-login)
 * - The user object (role, name, id) is kept in React state — never in localStorage
 * - login/adminLogin/logout call the corresponding backend endpoints
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'principal' | 'vice_principal' | 'coordinator' | 'staff' | 'student';
  fullName?: string;
  studentId?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Derived role helpers
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
  // Actions
  login: (identifier: string, password: string) => Promise<AuthUser>;
  adminLogin: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STAFF_ROLES = ['teacher', 'principal', 'vice_principal', 'coordinator', 'staff', 'admin'];

// ─── Helper: fetch with cookie credentials ───────────────────────────────────
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Always send the httpOnly JWT cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data as T;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount while checking session

  // Derived role booleans
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';
  const isStaff = user !== null && STAFF_ROLES.includes(user.role);
  const isStudent = user?.role === 'student';

  /**
   * checkAuth: Called on mount.
   * Hits GET /api/auth/me — the backend validates the httpOnly cookie and returns
   * the user object if valid, or 401 if the cookie is missing/expired.
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: AuthUser }>('/auth/me');
      setUser(response.data);
    } catch {
      // Cookie missing or expired — user is not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on every mount / page refresh
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * login: For students and staff using email or studentId.
   * Backend sets the httpOnly cookie in the Set-Cookie header.
   * We store only the user object in React state.
   */
  const login = async (identifier: string, password: string): Promise<AuthUser> => {
    const payload = identifier.includes('@')
      ? { email: identifier, password }
      : { studentId: identifier, password };

    const response = await apiFetch<{ success: boolean; data: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setUser(response.data);
    return response.data;
  };

  /**
   * adminLogin: For admin users only.
   * Backend validates role === 'admin' and sets the httpOnly cookie.
   */
  const adminLogin = async (email: string, password: string): Promise<AuthUser> => {
    const response = await apiFetch<{ success: boolean; user: AuthUser }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(response.user);
    return response.user;
  };

  /**
   * logout: Calls POST /api/auth/logout which clears the httpOnly cookie server-side.
   * We also clear our local state.
   */
  const logout = async (): Promise<void> => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isStaff,
        isStudent,
        login,
        adminLogin,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
