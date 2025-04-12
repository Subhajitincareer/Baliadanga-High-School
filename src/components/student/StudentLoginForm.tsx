
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginSchema, LoginFormValues } from '@/schemas/studentAuth';
import { LogIn } from 'lucide-react';

interface StudentLoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  loading: boolean;
  defaultEmail?: string;
}

export const StudentLoginForm = ({ onSubmit, loading, defaultEmail = "" }: StudentLoginFormProps) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
    },
  });

  return (
    <>
      <div className="flex items-center">
        <LogIn className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-semibold">Student Login</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Enter your credentials to access your student dashboard
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="student@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </>
  );
};
