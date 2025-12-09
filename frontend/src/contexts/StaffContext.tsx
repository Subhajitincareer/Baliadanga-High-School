import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService, { User } from '@/services/api';
import { useNavigate } from 'react-router-dom';

type StaffContextType = {
    isStaff: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isStaff, setIsStaff] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    const STAFF_ROLES = ['teacher', 'principal', 'vice_principal', 'coordinator', 'staff', 'admin'];

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // apiService.login returns { token, user, message? }
            const { token, user } = await apiService.login(email, password);

            if (!token || !user?.role) {
                toast({
                    title: 'Login Failed',
                    description: 'Invalid response from server.',
                    variant: 'destructive',
                });
                return false;
            }

            // Check if user is actually a staff member
            if (!STAFF_ROLES.includes(user.role)) {
                toast({
                    title: 'Access Denied',
                    description: 'This portal is for Faculty and Staff only.',
                    variant: 'destructive',
                });
                return false;
            }

            // Store tokens/user info for session
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userId', user._id);
            localStorage.setItem('user', JSON.stringify(user));

            setIsStaff(true);
            setUser(user);

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${user.name || 'Staff Member'}!`
            });

            navigate('/staff/dashboard');
            return true;
        } catch (error: any) {
            console.error('Login error:', error);
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
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsStaff(false);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            navigate('/staff/login');
            toast({
                title: 'Logged Out',
                description: 'You have been logged out successfully.',
            });
        }
    };

    useEffect(() => {
        const maybeSession = () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('userRole');
            const storedUser = localStorage.getItem('user');

            if (token && role && STAFF_ROLES.includes(role)) {
                setIsStaff(true);
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error("Failed to parse stored user", e);
                    }
                }
            }
        };
        maybeSession();
    }, []);

    return (
        <StaffContext.Provider value={{ isStaff, user, login, logout }}>
            {children}
        </StaffContext.Provider>
    );
};

export const useStaff = () => {
    const context = useContext(StaffContext);
    if (!context) {
        throw new Error('useStaff must be used within a StaffProvider');
    }
    return context;
};
