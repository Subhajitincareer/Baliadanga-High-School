
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from 'lucide-react';
import { StudentLoginForm } from '@/components/student/StudentLoginForm';
import { StudentRegisterForm } from '@/components/student/StudentRegisterForm';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { LoginFormValues, RegisterFormValues } from '@/schemas/studentAuth';

const StudentLogin = () => {
  const { loading, handleLogin, handleRegister } = useStudentAuth();
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    const email = await handleRegister(data);
    if (email) {
      setRegisteredEmail(email);
    }
  };

  return (
    <div className="container py-8 flex-1">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-6 w-6 text-school-primary" />
          <h1 className="text-3xl font-bold">Student Portal</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-md">
          Login or register to access your academic information, results, and more
        </p>
      </div>

      <Card className="mx-auto max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <CardHeader>
              <CardTitle>Student Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your student dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentLoginForm 
                onSubmit={handleLogin} 
                loading={loading}
                defaultEmail={registeredEmail}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="register">
            <CardHeader>
              <CardTitle>Student Registration</CardTitle>
              <CardDescription>
                Create a new student account to access your academic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentRegisterForm 
                onSubmit={onRegisterSubmit} 
                loading={loading}
              />
            </CardContent>
          </TabsContent>
        </Tabs>
        <CardFooter className="flex justify-center border-t pt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            Back to School Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentLogin;
