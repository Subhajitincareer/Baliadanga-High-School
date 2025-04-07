
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

const AdminLogin = () => {
  const [adminKey, setAdminKey] = useState('');
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(adminKey);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Admin Access</h1>
        <p className="mb-8 text-muted-foreground">
          Enter admin key to manage school content
        </p>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Administrator Login</CardTitle>
              <CardDescription>Enter the admin key to access administrative functions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-key">Admin Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-key"
                    type="password"
                    placeholder="Enter admin key"
                    className="pl-10"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-school-primary hover:bg-school-primary/90">
                Access Admin Portal
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
