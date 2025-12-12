import React, { useState } from 'react';
import {
    BellRing, Users, GraduationCap, Award, BookOpen, PenTool,
    UserPlus, FileText, Calendar as CalendarIcon, Table as TableIcon,
    DollarSign, CheckSquare, Shield, ArrowUpCircle, Menu, Home,
    LayoutTemplate, Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils'; // Assuming this exists, standard in shadcn/ui

interface AdminMobileNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ activeTab, setActiveTab }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setIsOpen(false);
    };

    const menuItems = [
        { id: 'announcements', label: 'Announcements', icon: BellRing },
        { id: 'staff', label: 'Staff Directory', icon: Users },
        { id: 'students', label: 'Students', icon: UserPlus },
        { id: 'fees', label: 'Fees', icon: DollarSign },
        { id: 'admissions', label: 'Admissions', icon: GraduationCap },
        { id: 'results', label: 'Results', icon: Award },
        { id: 'exams', label: 'Exams', icon: BookOpen },
        { id: 'marks', label: 'Marks', icon: PenTool },
        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
        { id: 'resources', label: 'Resources', icon: FileText },
        { id: 'attendance', label: 'Attendance', icon: CheckSquare },
        { id: 'routines', label: 'Routines', icon: TableIcon },
        { id: 'promotion', label: 'Promotion', icon: ArrowUpCircle },
        { id: 'permissions', label: 'Permissions', icon: Shield },
        { id: 'idcards', label: 'ID Cards', icon: LayoutTemplate },
        { id: 'meal', label: 'Mid-Day Meal', icon: Utensils },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden">
            {/* Quick Access Items */}
            <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col gap-1 h-auto py-2", activeTab === 'announcements' && "text-school-primary")}
                onClick={() => setActiveTab('announcements')}
            >
                <BellRing className="h-5 w-5" />
                <span className="text-[10px]">Home</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col gap-1 h-auto py-2", activeTab === 'students' && "text-school-primary")}
                onClick={() => setActiveTab('students')}
            >
                <UserPlus className="h-5 w-5" />
                <span className="text-[10px]">Students</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col gap-1 h-auto py-2", activeTab === 'staff' && "text-school-primary")}
                onClick={() => setActiveTab('staff')}
            >
                <Users className="h-5 w-5" />
                <span className="text-[10px]">Staff</span>
            </Button>

            {/* More Menu (Sheet) */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2">
                        <Menu className="h-5 w-5" />
                        <span className="text-[10px]">Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80vw] sm:w-[350px] overflow-y-auto">
                    <SheetHeader className="mb-4 text-left">
                        <SheetTitle className="text-school-primary">Admin Menu</SheetTitle>
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
