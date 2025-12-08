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
            const resp: any = await apiService.login(email, password);

            // The API returns { success: true, data: { token, ... } }
            // So we need to access resp.data.token, not resp.token
            const authData = resp.data || resp;

            if (!authData?.token || !authData?.role) {
                toast({
                    title: 'Login Failed',
                    description: resp?.message || 'Invalid credentials.',
                    variant: 'destructive',
                });
                return false;
            }

            // Check if user is actually a staff member
            if (!STAFF_ROLES.includes(authData.role)) {
                toast({
                    title: 'Access Denied',
                    description: 'This portal is for Faculty and Staff only.',
                    variant: 'destructive',
                });
                return false;
            }

            // Store tokens/user info for session
            localStorage.setItem('token', authData.token);
            localStorage.setItem('userRole', authData.role);
            localStorage.setItem('userId', authData._id); // Assuming _id is top level in data
            // User object might be mixed in data based on authController
            // data: { _id, name, email, role, token }
            localStorage.setItem('user', JSON.stringify(authData));

            setIsStaff(true);
            setUser(authData);

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${authData.name || 'Staff Member'}!`
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
