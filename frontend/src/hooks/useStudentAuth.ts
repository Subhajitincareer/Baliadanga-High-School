import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api'; // <-- your API service
import { LoginFormValues, RegisterFormValues } from '@/schemas/studentAuth';

export const useStudentAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      // Use API service to login
      const response = await apiService.login(data.email, data.password);
      if (response && response.token && response.user) {
        // Store JWT and user info in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.user.role || 'student');
        localStorage.setItem('userId', response.user._id);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast({
          title: "Login successful",
          description: "Welcome back to your student dashboard"
        });
        navigate('/student/dashboard');
      } else {
        throw new Error('Invalid login response from server');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      // Register the user profile (adjust field names for your DB schema)
      const registerPayload = {
        fullName: data.fullName,
        rollNumber: data.rollNumber,
        className: data.className,
        email: data.email,
        password: data.password,
        role: 'student'
      };
      const response = await apiService.register(registerPayload);

      if (!response || response.success === false) {
        throw new Error(response?.message || 'Registration failed');
      }

      toast({
        title: "Registration successful",
        description: "Your student account has been created. You can now log in.",
      });
      return data.email; // return for autofill
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogin,
    handleRegister
  };
};
