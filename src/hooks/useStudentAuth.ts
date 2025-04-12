
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoginFormValues, RegisterFormValues } from '@/schemas/studentAuth';

export const useStudentAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back to your student dashboard",
      });
      
      navigate('/student/dashboard');
    } catch (error) {
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
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Add student profile data to the students table
        const { error: profileError } = await supabase
          .from('students')
          .insert({
            user_id: authData.user.id,
            full_name: data.fullName,
            roll_number: data.rollNumber,
            class_name: data.className,
            email: data.email,
          });

        if (profileError) throw profileError;
      }

      toast({
        title: "Registration successful",
        description: "Your student account has been created. Please check your email for verification.",
      });
      
      return data.email; // Return email for auto-filling login form
    } catch (error) {
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
