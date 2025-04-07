
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Lock, User, Mail } from 'lucide-react';

const Portal = () => {
  const { toast } = useToast();
  const [studentLoginData, setStudentLoginData] = useState({ username: '', password: '' });
  const [parentLoginData, setParentLoginData] = useState({ username: '', password: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleStudentLogin = (e) => {
    e.preventDefault();
    toast({
      title: "Login Attempt",
      description: "Student portal login functionality is coming soon. Please check back later.",
    });
  };

  const handleParentLogin = (e) => {
    e.preventDefault();
    toast({
      title: "Login Attempt",
      description: "Parent portal login functionality is coming soon. Please check back later.",
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password Reset",
      description: "If your email is registered, you will receive password reset instructions.",
    });
    setForgotPasswordEmail('');
  };

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Student & Parent Portal</h1>
        <p className="mb-8 text-muted-foreground">
          Access grades, assignments, and school communications
        </p>
        
        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student Login</TabsTrigger>
            <TabsTrigger value="parent">Parent Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student">
            <Card>
              <form onSubmit={handleStudentLogin}>
                <CardHeader>
                  <CardTitle>Student Portal</CardTitle>
                  <CardDescription>Enter your student ID and password to access your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-username">Student ID</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="student-username"
                        placeholder="Enter your student ID"
                        className="pl-10"
                        value={studentLoginData.username}
                        onChange={(e) => setStudentLoginData({ ...studentLoginData, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="student-password">Password</Label>
                      <a href="#forgot-password" className="text-xs text-school-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={studentLoginData.password}
                        onChange={(e) => setStudentLoginData({ ...studentLoginData, password: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-school-primary hover:bg-school-dark">
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="parent">
            <Card>
              <form onSubmit={handleParentLogin}>
                <CardHeader>
                  <CardTitle>Parent Portal</CardTitle>
                  <CardDescription>Enter your credentials to access your child's information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="parent-username"
                        placeholder="Enter your username"
                        className="pl-10"
                        value={parentLoginData.username}
                        onChange={(e) => setParentLoginData({ ...parentLoginData, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="parent-password">Password</Label>
                      <a href="#forgot-password" className="text-xs text-school-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="parent-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={parentLoginData.password}
                        onChange={(e) => setParentLoginData({ ...parentLoginData, password: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-school-primary hover:bg-school-dark">
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div id="forgot-password" className="mt-8 rounded-lg border border-dashed border-gray-300 p-6">
          <h3 className="mb-4 text-lg font-semibold">Forgot Password?</h3>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your registered email"
                  className="pl-10"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full border-school-primary text-school-primary hover:bg-school-primary hover:text-white"
            >
              Reset Password
            </Button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Having trouble logging in? Contact IT support at{" "}
            <a 
              href="mailto:support@baliadangahs.edu" 
              className="text-school-primary hover:underline"
            >
              support@baliadangahs.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Portal;
