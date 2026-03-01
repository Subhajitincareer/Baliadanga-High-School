import React, { useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    GraduationCap,
    BookOpen,
    FileQuestion,
    User as UserIcon,
    Menu,
    Lock,
    Library
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface StaffMobileNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    hasPermission: (permission: string) => boolean;
    userRole: string;
}

export const StaffMobileNav: React.FC<StaffMobileNavProps> = ({ activeTab, setActiveTab, hasPermission, userRole }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setIsOpen(false);
    };

    const navItems = [
        { id: 'home', label: 'Home', icon: LayoutDashboard, show: true },
        { id: 'routine', label: 'Routine', icon: Calendar, show: true },
        { id: 'attendance', label: 'Attendance', icon: CheckSquare, show: hasPermission('TAKE_ATTENDANCE') },
        { id: 'marks', label: 'Marks', icon: GraduationCap, show: hasPermission('MANAGE_RESULTS') },
        { id: 'homework', label: 'Homework', icon: BookOpen, show: ['teacher', 'principal', 'vice_principal'].includes(userRole) },
        { id: 'resources', label: 'Resources', icon: BookOpen, show: hasPermission('MANAGE_ACADEMIC') },
        { id: 'course-materials', label: 'Course Materials', icon: Library, show: hasPermission('MANAGE_ACADEMIC') },
        { id: 'question-paper', label: 'Question Paper', icon: FileQuestion, show: ['teacher', 'principal', 'vice_principal'].includes(userRole) },
        { id: 'admissions', label: 'Admissions', icon: UserIcon, show: hasPermission('MANAGE_ADMISSION') },
        { id: 'profile', label: 'Profile', icon: UserIcon, show: true },
        { id: 'settings', label: 'Security', icon: Lock, show: true },
    ];

    const visibleNavItems = navItems.filter(item => item.show);
    
    // Select up to 3 quick access items
    const quickAccessItems = visibleNavItems.slice(0, 3);
    const hasAttendance = visibleNavItems.find(i => i.id === 'attendance');
    const hasRoutine = visibleNavItems.find(i => i.id === 'routine');
    
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2 sm:px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden print:hidden">
            {/* Quick Access Items */}
            <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col gap-1 h-auto py-2 flex-1", activeTab === 'home' && "text-school-primary")}
                onClick={() => setActiveTab('home')}
            >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-[10px]">Home</span>
            </Button>
            
            {hasRoutine && (
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("flex flex-col gap-1 h-auto py-2 flex-1", activeTab === 'routine' && "text-school-primary")}
                    onClick={() => setActiveTab('routine')}
                >
                    <Calendar className="h-5 w-5" />
                    <span className="text-[10px]">Routine</span>
                </Button>
            )}

            {hasAttendance ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("flex flex-col gap-1 h-auto py-2 flex-1", activeTab === 'attendance' && "text-school-primary")}
                    onClick={() => setActiveTab('attendance')}
                >
                    <CheckSquare className="h-5 w-5" />
                    <span className="text-[10px]">Attendance</span>
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("flex flex-col gap-1 h-auto py-2 flex-1", activeTab === 'profile' && "text-school-primary")}
                    onClick={() => setActiveTab('profile')}
                >
                    <UserIcon className="h-5 w-5" />
                    <span className="text-[10px]">Profile</span>
                </Button>
            )}


            {/* More Menu (Sheet) */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2 flex-1">
                        <Menu className="h-5 w-5" />
                        <span className="text-[10px]">Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80vw] sm:w-[350px] overflow-y-auto">
                    <SheetHeader className="mb-4 text-left">
                        <SheetTitle className="text-school-primary flex items-center gap-2">
                           <LayoutDashboard className="h-5 w-5"/> Staff Menu
                        </SheetTitle>
                        <SheetDescription>Access all your modules</SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-2">
                        {visibleNavItems.map((item) => (
                            <Button
                                key={item.id}
                                variant={activeTab === item.id ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", activeTab === item.id && "bg-school-primary/10 text-school-primary")}
                                onClick={() => handleTabClick(item.id)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};
