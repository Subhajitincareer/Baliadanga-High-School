import React, { useState } from 'react';
import {
    LayoutDashboard, Award, CalendarDays, Bell, IndianRupee, BookOpen, User, Menu, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface StudentMobileNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const StudentMobileNav: React.FC<StudentMobileNavProps> = ({ activeTab, setActiveTab }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setIsOpen(false);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: CalendarDays },
        { id: 'results', label: 'Results', icon: Award },
        { id: 'schedule', label: 'Schedule', icon: Clock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'fees', label: 'Fees', icon: IndianRupee },
        { id: 'homework', label: 'Homework', icon: BookOpen },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden print:hidden">
            {/* Quick Access Items */}
            <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col gap-1 h-auto py-2 flex-1", activeTab === 'dashboard' && "text-school-primary")}
                onClick={() => setActiveTab('dashboard')}
            >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-[10px]">Home</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col gap-1 h-auto py-2 flex-1", activeTab === 'homework' && "text-school-primary")}
                onClick={() => setActiveTab('homework')}
            >
                <BookOpen className="h-5 w-5" />
                <span className="text-[10px]">Homework</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col gap-1 h-auto py-2 flex-1", activeTab === 'schedule' && "text-school-primary")}
                onClick={() => setActiveTab('schedule')}
            >
                <Clock className="h-5 w-5" />
                <span className="text-[10px]">Schedule</span>
            </Button>

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
                        <SheetTitle className="text-school-primary">Student Menu</SheetTitle>
                        <SheetDescription>Access all your modules</SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-2">
                        {menuItems.map((item) => (
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
