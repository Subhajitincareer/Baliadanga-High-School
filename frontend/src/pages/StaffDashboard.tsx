import React, { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    LayoutDashboard,
    User as UserIcon,
    LogOut,
    IdCard,
    Camera,
    Lock
} from 'lucide-react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const StaffDashboard = () => {
    const { user, logout } = useStaff();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('home');
    const [isLoading, setIsLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (activeTab === 'profile') {
            fetchProfile();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const data = await apiService.getMyStaffProfile();
            setProfileData(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiService.updateMyStaffProfile({
                fullName: profileData.fullName,
                email: profileData.email,
                department: profileData.department
            });
            toast({ title: "Success", description: "Profile updated successfully" });
            setIsEditing(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            await apiService.updatePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast({ title: "Success", description: "Password updated. Please login again." });
            logout();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold flex items-center text-school-primary">
                        <LayoutDashboard className="mr-2 h-6 w-6" />
                        Staff Portal
                    </h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Button
                        variant={activeTab === 'home' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('home')}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                    <Button
                        variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('profile')}
                    >
                        <UserIcon className="mr-2 h-4 w-4" /> My Profile
                    </Button>
                    <Button
                        variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('settings')}
                    >
                        <Lock className="mr-2 h-4 w-4" /> Security
                    </Button>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Role</CardTitle>
                                    <IdCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold capitalize">{user?.role}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column: Image */}
                            <Card className="md:col-span-1">
                                <CardContent className="pt-6 flex flex-col items-center">
                                    <div className="relative w-32 h-32 mb-4">
                                        <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-slate-100">
                                            {/* Placeholder for real image or User Icon */}
                                            <UserIcon className="h-16 w-16 text-slate-400" />
                                        </div>
                                        <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h3 className="font-semibold text-lg">{user?.name}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                                </CardContent>
                            </Card>

                            {/* Right Column: Details */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Personal Details</CardTitle>
                                    <CardDescription>Manage your personal information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Full Name</Label>
                                                <Input
                                                    value={profileData?.fullName || user?.name || ''}
                                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Employee ID</Label>
                                                <Input value={profileData?.employeeId || ''} disabled />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={profileData?.email || user?.email || ''} disabled />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Department</Label>
                                                <Input value={profileData?.department || ''} disabled={!isEditing}
                                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Position</Label>
                                                <Input value={profileData?.position || ''} disabled />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            {!isEditing ? (
                                                <Button type="button" onClick={() => setIsEditing(true)}>Edit Details</Button>
                                            ) : (
                                                <div className="space-x-2">
                                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                                    <Button type="submit" disabled={isLoading}>Save Changes</Button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">Security Settings</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password to keep your account secure.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
};
export default StaffDashboard;
