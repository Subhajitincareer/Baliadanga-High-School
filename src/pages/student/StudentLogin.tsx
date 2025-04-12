
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from 'lucide-react';
import { StudentLoginForm } from '@/components/student/StudentLoginForm';
import { StudentRegisterForm } from '@/components/student/StudentRegisterForm';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { RegisterFormValues } from '@/schemas/studentAuth';

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
    <div className="container py-8 flex-1 min-h-[calc(100vh-80px)]">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-8 w-8 text-school-primary" />
          <h1 className="text-3xl font-bold">Student Portal</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-md">
          Login or register to access your academic information, results, and more
        </p>
      </div>

      <Card className="mx-auto max-w-md shadow-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="p-1">
            <CardHeader>
              <CardTitle className="text-xl">Student Login</CardTitle>
              <CardDescription>
                Access your student dashboard with your credentials
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
          
          <TabsContent value="register" className="p-1">
            <CardHeader>
              <CardTitle className="text-xl">Student Registration</CardTitle>
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
        <CardFooter className="flex justify-center border-t pt-4 pb-6">
          <Link to="/" className="text-sm text-school-primary hover:underline transition-all">
            Back to School Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentLogin;
