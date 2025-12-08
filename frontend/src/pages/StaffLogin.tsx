import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useStaff } from '@/contexts/StaffContext';

const StaffLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useStaff();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await login(email, password);
        setIsLoading(false);
    };

    return (
        <div className="container flex min-h-screen flex-col items-center justify-center py-12 bg-slate-50">
            <div className="mx-auto w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-white rounded-full shadow-md">
                        <GraduationCap className="h-10 w-10 text-school-primary" />
                    </div>
                </div>
                <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Faculty Access</h1>
                <p className="mb-8 text-muted-foreground">
                    Secure login for Teachers and Staff members
                </p>

                <Card className="shadow-lg border-school-primary/10">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Staff Login</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="staff-email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="staff-email"
                                        type="email"
                                        placeholder="name@school.edu"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <Label htmlFor="staff-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="staff-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full bg-school-primary hover:bg-school-primary/90"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Sign In'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <p className="mt-4 text-sm text-muted-foreground">
                    Default password for new accounts is <strong>changeme123</strong>
                </p>
            </div>
        </div>
    );
};

export default StaffLogin;
