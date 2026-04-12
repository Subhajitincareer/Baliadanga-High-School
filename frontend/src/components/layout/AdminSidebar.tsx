import React, { FC } from "react";
import { NavLink } from "react-router-dom";
import { 
  BellRing, Users, GraduationCap, Award, BookOpen, PenTool, 
  UserPlus, FileText, Calendar as CalendarIcon, Table as TableIcon, 
  DollarSign, CheckSquare, Shield, ArrowUpCircle, LayoutTemplate, 
  Utensils, Globe 
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";

const AdminSidebar: FC = () => {
  const { logout } = useAdmin();
  const userRole = localStorage.getItem('userRole') || 'admin';

  // Define tab visibility logic (reused from Dashboard.tsx)
  const canAccess = (tab: string) => {
    if (userRole === 'admin' || userRole === 'principal') return true;
    const teacherTabs = ['announcements', 'attendance', 'meal', 'calendar', 'results', 'marks', 'exams', 'routines', 'idcards', 'students', 'resources', 'course-materials', 'events', 'gallery'];
    const staffTabs = ['announcements', 'attendance', 'meal', 'fees', 'students', 'idcards', 'admissions', 'resources', 'course-materials', 'events', 'gallery'];
    if (userRole === 'teacher') return teacherTabs.includes(tab);
    if (userRole === 'staff') return staffTabs.includes(tab);
    return false;
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    cn(
      "flex w-full items-center justify-start rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-school-primary/10 hover:text-school-primary",
      isActive ? "bg-school-primary/10 text-school-primary" : "text-muted-foreground"
    );

  return (
    <div className="hidden border-r bg-white md:block md:w-64 lg:w-72 print:hidden">
      <div className="flex h-16 items-center border-b px-6">
        <span className="font-bold text-lg text-school-primary">Admin Portal</span>
      </div>
      
      <div className="flex flex-1 flex-col overflow-auto py-4">
        <div className="w-full px-3 py-2">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <BellRing className="mr-2 h-4 w-4" /> Announcements
          </NavLink>
        </div>

        <Accordion type="multiple" defaultValue={['people', 'academic', 'management']} className="w-full px-3">
          <AccordionItem value="people" className="border-b-0">
            <AccordionTrigger className="py-2 hover:no-underline text-sm font-semibold text-slate-500 hover:text-slate-800">
              People
            </AccordionTrigger>
            <AccordionContent className="pb-2 pt-1 pl-2">
              <div className="flex flex-col space-y-1">
                {canAccess('students') && (
                  <NavLink to="/admin/students" className={navLinkClass}>
                    <UserPlus className="mr-2 h-4 w-4" /> Students
                  </NavLink>
                )}
                {canAccess('staff') && (
                  <NavLink to="/admin/staff" className={navLinkClass}>
                    <Users className="mr-2 h-4 w-4" /> Staff
                  </NavLink>
                )}
                {canAccess('idcards') && (
                  <NavLink to="/admin/id-cards" className={navLinkClass}>
                    <LayoutTemplate className="mr-2 h-4 w-4" /> ID Cards
                  </NavLink>
                )}
                {canAccess('permissions') && (
                  <NavLink to="/admin/permissions" className={navLinkClass}>
                    <Shield className="mr-2 h-4 w-4" /> Permissions
                  </NavLink>
                )}
                {canAccess('promotion') && (
                  <NavLink to="/admin/promotions" className={navLinkClass}>
                    <ArrowUpCircle className="mr-2 h-4 w-4" /> Promotion
                  </NavLink>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="academic" className="border-b-0">
            <AccordionTrigger className="py-2 hover:no-underline text-sm font-semibold text-slate-500 hover:text-slate-800">
              Academic
            </AccordionTrigger>
            <AccordionContent className="pb-2 pt-1 pl-2">
              <div className="flex flex-col space-y-1">
                {canAccess('routines') && (
                  <NavLink to="/admin/routines" className={navLinkClass}>
                    <TableIcon className="mr-2 h-4 w-4" /> Class Routines
                  </NavLink>
                )}
                {canAccess('exams') && (
                  <NavLink to="/admin/exams" className={navLinkClass}>
                    <BookOpen className="mr-2 h-4 w-4" /> Exams
                  </NavLink>
                )}
                {canAccess('marks') && (
                  <NavLink to="/admin/marks-entry" className={navLinkClass}>
                    <PenTool className="mr-2 h-4 w-4" /> Marks Entry
                  </NavLink>
                )}
                {canAccess('results') && (
                  <NavLink to="/admin/results" className={navLinkClass}>
                    <Award className="mr-2 h-4 w-4" /> Results
                  </NavLink>
                )}
                {canAccess('course-materials') && (
                  <NavLink to="/admin/course-materials" className={navLinkClass}>
                    <BookOpen className="mr-2 h-4 w-4" /> Course Materials
                  </NavLink>
                )}
                {canAccess('calendar') && (
                  <NavLink to="/admin/calendar" className={navLinkClass}>
                    <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
                  </NavLink>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="management" className="border-b-0">
            <AccordionTrigger className="py-2 hover:no-underline text-sm font-semibold text-slate-500 hover:text-slate-800">
              Management
            </AccordionTrigger>
            <AccordionContent className="pb-2 pt-1 pl-2">
              <div className="flex flex-col space-y-1">
                {canAccess('fees') && (
                  <NavLink to="/admin/fees" className={navLinkClass}>
                    <DollarSign className="mr-2 h-4 w-4" /> Fees
                  </NavLink>
                )}
                {canAccess('admissions') && (
                  <NavLink to="/admin/admissions" className={navLinkClass}>
                    <GraduationCap className="mr-2 h-4 w-4" /> Admissions
                  </NavLink>
                )}
                {canAccess('attendance') && (
                  <NavLink to="/admin/attendance" className={navLinkClass}>
                    <CheckSquare className="mr-2 h-4 w-4" /> Attendance
                  </NavLink>
                )}
                {canAccess('meal') && (
                  <NavLink to="/admin/mid-day-meal" className={navLinkClass}>
                    <Utensils className="mr-2 h-4 w-4" /> Mid-Day Meal
                  </NavLink>
                )}
                {canAccess('resources') && (
                  <NavLink to="/admin/resources" className={navLinkClass}>
                    <FileText className="mr-2 h-4 w-4" /> Resources
                  </NavLink>
                )}
                {canAccess('events') && (
                  <NavLink to="/admin/events" className={navLinkClass}>
                    <CalendarIcon className="mr-2 h-4 w-4" /> Events
                  </NavLink>
                )}
                {canAccess('gallery') && (
                  <NavLink to="/admin/gallery" className={navLinkClass}>
                    <LayoutTemplate className="mr-2 h-4 w-4" /> Gallery
                  </NavLink>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Site Settings — admin/principal only */}
        {canAccess('site-settings') && (
          <div className="w-full px-3 py-2">
            <NavLink to="/admin/site-settings" className={navLinkClass}>
              <Globe className="mr-2 h-4 w-4" /> Site Settings
            </NavLink>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <Button variant="outline" className="w-full justify-start" onClick={logout}>Log out</Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
