import React, { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Import
import {
    LayoutDashboard,
    User as UserIcon,
    LogOut,
    IdCard,
    Camera,
    Lock,
    Calendar,
    CheckSquare,
    BookOpen,
    GraduationCap
} from 'lucide-react';
import AttendancePage from '@/pages/admin/AttendancePage';
import AdmissionManagement from '@/pages/admin/AdmissionManagement';
import ExamManagement from '@/pages/admin/ExamManagement';
import { HomeworkAssignment } from '@/components/staff/HomeworkAssignment';
import { ResourceManagement } from '@/components/admin/ResourceManagement';
import apiService, { Routine } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Helper for ordinal suffix
const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const StaffDashboard = () => {
    const { user, logout, hasPermission } = useStaff();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('home');
    const [isLoading, setIsLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Routine State
    const [myRoutines, setMyRoutines] = useState<Routine[]>([]);

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (activeTab === 'profile') {
            fetchProfile();
        } else if (activeTab === 'routine') {
            fetchMyRoutine();
        }
    }, [activeTab]);

    const fetchMyRoutine = async () => {
        // Fallback for name field mismatch (backend 'name' vs frontend 'fullName')
        const myName = user?.fullName || user?.name;

        if (!myName) {
            console.log("StaffDashboard: No user name available (fullName or name)");
            console.log("Current user object:", user);
            return;
        }
        console.log("StaffDashboard: Fetching routine for:", myName);
        setIsLoading(true);
        try {
            const data = await apiService.getTeacherRoutine(myName);
            console.log("StaffDashboard: Raw Routine Data:", data);
            setMyRoutines(data);
        } catch (error) {
            console.error("StaffDashboard: Error fetching routine", error);
            toast({ title: "Error", description: "Failed to fetch routine", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

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

    // Helper to process routines into a daily schedule for this teacher
    const getDailySchedule = (day: string) => {
        const schedule: any[] = [];
        const userName = user?.fullName || user?.name;
        const myName = userName?.trim().toLowerCase();

        if (!myName) return [];

        myRoutines.forEach(routine => {
            const dayRoutine = routine.weekSchedule.find(d => d.day === day);
            if (dayRoutine) {
                let periodIndex = 0;

                dayRoutine.periods.forEach((period) => {
                    // Check if it's tiffin to handle counting logic, 
                    // although teachers usually aren't assigned to "Tiffin" specifically as a class.
                    // But we need accurate Period Numbers for the class they ARE assigned to.
                    // IMPORTANT: The period number depends on the CLASS's schedule sequence.

                    if (period.subject !== 'Tiffin') {
                        periodIndex++;
                    }

                    // Case-insensitive check
                    const periodTeacher = period.teacher?.trim().toLowerCase();

                    if (periodTeacher === myName) {
                        schedule.push({
                            ...period,
                            className: routine.className,
                            section: routine.section,
                            periodLabel: period.subject === 'Tiffin' ? 'Tiffin' : `${getOrdinal(periodIndex)} Period`
                        });
                    }
                });
            }
        });
        // Sort by start time
        return schedule.sort((a, b) => {
            const timeA = parseInt(a.startTime.replace(':', ''));
            const timeB = parseInt(b.startTime.replace(':', ''));
            return timeA - timeB;
        });
    };

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const navItems = [
        { id: 'home', label: 'Home', icon: LayoutDashboard, show: true },
        { id: 'routine', label: 'Routine', icon: Calendar, show: true },
        { id: 'attendance', label: 'Attendance', icon: CheckSquare, show: hasPermission('TAKE_ATTENDANCE') },
        { id: 'marks', label: 'Marks', icon: GraduationCap, show: hasPermission('MANAGE_RESULTS') },
        { id: 'homework', label: 'Homework', icon: BookOpen, show: ['teacher', 'principal', 'vice_principal'].includes(user?.role || '') },
        { id: 'resources', label: 'Resources', icon: BookOpen, show: hasPermission('MANAGE_ACADEMIC') },
        { id: 'admissions', label: 'Admissions', icon: UserIcon, show: hasPermission('MANAGE_ADMISSION') },
        { id: 'profile', label: 'Profile', icon: UserIcon, show: true },
    ];
    const visibleNavItems = navItems.filter(item => item.show);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col flex-shrink-0">
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
                        variant={activeTab === 'routine' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('routine')}
                    >
                        <Calendar className="mr-2 h-4 w-4" /> My Routine
                    </Button>

                    {hasPermission('TAKE_ATTENDANCE') && (
                        <Button
                            variant={activeTab === 'attendance' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('attendance')}
                        >
                            <CheckSquare className="mr-2 h-4 w-4" /> Take Attendance
                        </Button>
                    )}

                    {hasPermission('MANAGE_RESULTS') && (
                        <Button
                            variant={activeTab === 'marks' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('marks')}
                        >
                            <GraduationCap className="mr-2 h-4 w-4" /> Review Marks
                        </Button>
                    )}

                    {['teacher', 'principal', 'vice_principal'].includes(user?.role || '') && (
                        <Button
                            variant={activeTab === 'homework' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('homework')}
                        >
                            <BookOpen className="mr-2 h-4 w-4" /> Homework
                        </Button>
                    )}

                    {hasPermission('MANAGE_ACADEMIC') && (
                        <Button
                            variant={activeTab === 'resources' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('resources')}
                        >
                            <BookOpen className="mr-2 h-4 w-4" /> Resources
                        </Button>
                    )}

                    {hasPermission('MANAGE_ADMISSION') && (
                        <Button
                            variant={activeTab === 'admissions' ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('admissions')}
                        >
                            <UserIcon className="mr-2 h-4 w-4" /> Admissions
                        </Button>
                    )}
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="flex h-16 items-center border-b bg-white px-4 justify-between flex-shrink-0 md:hidden shadow-sm z-10">
                    <span className="font-bold text-lg text-school-primary flex items-center">
                        <LayoutDashboard className="mr-2 h-6 w-6" />
                        Staff Portal
                    </span>
                    <Button variant="ghost" size="icon" onClick={logout} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-school-primary to-indigo-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.fullName || user?.name}</h1>
                                <p className="text-indigo-100 max-w-xl">
                                    Here's what's happening at Baliadanga High Hub today. Access your classes, mark attendance, and manage student performance from your dashboard.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                                <LayoutDashboard className="w-64 h-64" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="border-l-4 border-l-school-primary shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Current Role</CardTitle>
                                    <IdCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold capitalize">{user?.role}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Logged in securely</p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50" onClick={() => setActiveTab('routine')}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">My Schedule</CardTitle>
                                    <Calendar className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{getDailySchedule(DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1])?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Classes today</p>
                                </CardContent>
                            </Card>
                            
                            {hasPermission('TAKE_ATTENDANCE') && (
                            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50" onClick={() => setActiveTab('attendance')}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center">
                                        Take <span className="ml-2 text-sm font-normal text-muted-foreground">Now</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Record daily presence</p>
                                </CardContent>
                            </Card>
                            )}

                             {['teacher', 'principal', 'vice_principal'].includes(user?.role || '') && (
                            <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50" onClick={() => setActiveTab('homework')}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Homework</CardTitle>
                                    <BookOpen className="h-4 w-4 text-rose-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center">
                                        Assign <span className="ml-2 text-sm font-normal text-muted-foreground">Task</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Manage assignments</p>
                                </CardContent>
                            </Card>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'routine' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <h1 className="text-2xl font-bold flex items-center">
                            <Calendar className="mr-2 h-6 w-6" /> My Class Schedule
                        </h1>
                        <p className="text-muted-foreground">Your personal class routine across all sections.</p>

                        {isLoading ? (
                            <div className="flex justify-center p-8">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {DAYS.map(day => {
                                    const periods = getDailySchedule(day);
                                    if (periods.length === 0) return null;

                                    return (
                                        <Card key={day} className="overflow-hidden">
                                            <CardHeader className="bg-slate-100 py-3">
                                                <CardTitle className="text-lg font-semibold">{day}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="divide-y">
                                                    {periods.map((period, idx) => (
                                                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group relative">
                                                            {/* Period Label Badge */}
                                                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                                                {period.periodLabel}
                                                            </div>

                                                            <div>
                                                                <div className="font-bold text-lg text-school-primary flex items-center gap-2">
                                                                    <span>Class {period.className} - {period.section}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 font-medium">{period.subject}</div>
                                                            </div>
                                                            <div className="text-right mt-4 sm:mt-0">
                                                                <div className="font-mono font-bold text-gray-800">
                                                                    {period.startTime} - {period.endTime}
                                                                </div>
                                                                {period.roomNo && (
                                                                    <div className="text-xs text-muted-foreground mt-1 bg-slate-200 px-2 py-0.5 rounded-full inline-block">
                                                                        Room: {period.roomNo}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                {DAYS.every(day => getDailySchedule(day).length === 0) && (
                                    <div className="col-span-full text-center py-10 text-gray-500">
                                        No classes assigned to you yet, {user?.fullName || user?.name}.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="max-w-4xl mx-auto">
                        <AttendancePage />
                    </div>
                )}

                {activeTab === 'marks' && (
                    <div className="max-w-5xl mx-auto">
                        <ExamManagement />
                    </div>
                )}

                {activeTab === 'homework' && (
                    <div className="max-w-5xl mx-auto">
                        <HomeworkAssignment />
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="max-w-5xl mx-auto">
                        <ResourceManagement hideHeader={true} />
                    </div>
                )}

                {activeTab === 'admissions' && (
                    <div className="max-w-4xl mx-auto">
                        <AdmissionManagement hideHeader={true} />
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
                                    <h3 className="font-semibold text-lg">{user?.fullName || user?.name}</h3>
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
                                                    value={profileData?.fullName || user?.fullName || user?.name || ''}
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

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex overflow-x-auto [&::-webkit-scrollbar]:hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    {visibleNavItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center min-w-[72px] flex-1 py-3 transition-colors ${activeTab === item.id ? 'text-school-primary bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            <item.icon className={`h-5 w-5 mb-1 ${activeTab === item.id ? 'stroke-[2.5px]' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};
export default StaffDashboard;
