import React, { FC, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import AdminSidebar from "./AdminSidebar";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { useAdmin } from "@/contexts/AdminContext";
import { useLocation } from "react-router-dom";

const PageLoader = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <span className="ml-3 text-lg font-medium text-muted-foreground">Loading section...</span>
  </div>
);

const AdminLayout: FC = () => {
  const { logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  // Map path to title/subtitle for the header
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return { title: 'Manage Announcements', subtitle: 'Create and manage school announcements' };
    if (path.includes('staff')) return { title: 'Manage Staff', subtitle: 'Manage teacher and staff profiles' };
    if (path.includes('students')) return { title: 'Manage Students', subtitle: 'Add, edit, or bulk import students' };
    if (path.includes('fees')) return { title: 'Fee Management', subtitle: 'Manage fee structures and collect payments' };
    if (path.includes('admissions')) return { title: 'Admissions Management', subtitle: 'Review and process admission requests' };
    if (path.includes('results')) return { title: 'Student Results', subtitle: 'Manage examination results and reports' };
    if (path.includes('exams')) return { title: 'Exam Management', subtitle: 'Create and manage examination schedules' };
    if (path.includes('marks-entry')) return { title: 'Marks Entry', subtitle: 'Enter and update student performance marks' };
    if (path.includes('attendance')) return { title: 'Attendance', subtitle: 'Track daily student attendance records' };
    if (path.includes('routines')) return { title: 'Class Routines', subtitle: 'Manage class timetables and schedules' };
    if (path.includes('id-cards')) return { title: 'ID Card Generator', subtitle: 'Generate and print student ID cards' };
    if (path.includes('mid-day-meal')) return { title: 'Mid-Day Meal', subtitle: 'Track daily student meal consumption' };
    if (path.includes('site-settings')) return { title: 'Site Settings', subtitle: 'Configure school details and branding' };
    if (path.includes('events')) return { title: 'Events Management', subtitle: 'Manage upcoming school events' };
    if (path.includes('gallery')) return { title: 'Gallery Management', subtitle: 'Manage school photo gallery' };
    if (path.includes('promotions')) return { title: 'Student Promotion', subtitle: 'Manage year-end student promotions' };
    if (path.includes('permissions')) return { title: 'Role Permissions', subtitle: 'Manage access controls for staff' };
    if (path.includes('course-materials')) return { title: 'Course Materials', subtitle: 'Manage and upload learning resources' };
    if (path.includes('calendar')) return { title: 'Academic Calendar', subtitle: 'Manage holidays and academic milestones' };
    if (path.includes('resources')) return { title: 'School Resources', subtitle: 'Manage official forms and policies' };
    return { title: 'Admin Portal', subtitle: 'Welcome to the school management system' };
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="flex h-screen bg-gray-100/40">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <span className="font-bold text-lg text-school-primary">Admin Portal</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <DashboardHeader
            title={title}
            subtitle={subtitle}
            onLogout={logout}
            showLogout={false}
          />

          <div className="mt-6">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <AdminMobileNav activeTab={location.pathname.split('/').pop() || 'dashboard'} setActiveTab={(tab) => navigate(`/admin/${tab}`)} />
    </div>
  );
};

export default AdminLayout;
