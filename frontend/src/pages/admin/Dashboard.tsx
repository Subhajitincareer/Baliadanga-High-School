import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { AnnouncementTable } from '@/components/admin/AnnouncementTable';
import { AnnouncementToolbar } from '@/components/admin/AnnouncementToolbar';
import { Announcement } from '@/components/admin/AnnouncementForm';
import { AnnouncementDialog } from '@/components/admin/AnnouncementDialog';
import { DeleteAnnouncementDialog } from '@/components/admin/DeleteAnnouncementDialog';
import { useAnnouncements } from '@/hooks/use-announcements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaffManagement } from '@/components/admin/StaffManagement';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdmissionManagement from '@/pages/admin/AdmissionManagement';
import StudentResults from '@/pages/admin/StudentResults';
import ExamManagement from '@/pages/admin/ExamManagement';
import MarksEntry from '@/pages/admin/MarksEntry';
import StudentManagement from '@/pages/admin/StudentManagement';
import FeeManagement from '@/pages/admin/FeeManagement';
import { ResourceManagement } from '@/components/admin/ResourceManagement';
import { RoutineManagement } from '@/components/admin/RoutineManagement';
import { EventManagement } from '@/components/admin/EventManagement';
import AttendancePage from '@/pages/admin/AttendancePage';
import PermissionManagement from '@/pages/admin/PermissionManagement';
import PromotionManagement from '@/pages/admin/PromotionManagement';
import { BellRing, Users, GraduationCap, Award, BookOpen, PenTool, UserPlus, FileText, Calendar as CalendarIcon, Table as TableIcon, DollarSign, CheckSquare, Shield, ArrowUpCircle } from 'lucide-react';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [activeTab, setActiveTab] = useState('announcements');
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const { announcements, isLoading, fetchAnnouncements, handleDeleteAnnouncement } = useAnnouncements();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateClick = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement) return;

    const success = await handleDeleteAnnouncement(selectedAnnouncement);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchAnnouncements();
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading announcements..." />;
  }

  return (
    <div className="flex h-screen bg-gray-100/40">
      <div className="hidden border-r bg-white md:block md:w-64 lg:w-72">
        <div className="flex h-16 items-center border-b px-6">
          <span className="font-bold text-lg text-school-primary">Admin Portal</span>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <Tabs defaultValue="announcements" value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <TabsList className="flex h-full flex-col items-start justify-start space-y-1 bg-transparent p-4">
              <TabsTrigger value="announcements" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <BellRing className="mr-2 h-4 w-4" /> Announcements
              </TabsTrigger>
              <TabsTrigger value="staff" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <Users className="mr-2 h-4 w-4" /> Staff Directory
              </TabsTrigger>
              <TabsTrigger value="students" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <UserPlus className="mr-2 h-4 w-4" /> Student Management
              </TabsTrigger>
              <TabsTrigger value="fees" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <DollarSign className="mr-2 h-4 w-4" /> Fee Management
              </TabsTrigger>
              <TabsTrigger value="admissions" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <GraduationCap className="mr-2 h-4 w-4" /> Admissions
              </TabsTrigger>
              <TabsTrigger value="results" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <Award className="mr-2 h-4 w-4" /> Student Results
              </TabsTrigger>
              <TabsTrigger value="exams" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <BookOpen className="mr-2 h-4 w-4" /> Manage Exams
              </TabsTrigger>
              <TabsTrigger value="marks" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <PenTool className="mr-2 h-4 w-4" /> Marks Entry
              </TabsTrigger>
              <TabsTrigger value="calendar" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <CalendarIcon className="mr-2 h-4 w-4" /> Academic Calendar
              </TabsTrigger>
              <TabsTrigger value="resources" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <FileText className="mr-2 h-4 w-4" /> Resources
              </TabsTrigger>
              <TabsTrigger value="attendance" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <CheckSquare className="mr-2 h-4 w-4" /> Attendance
              </TabsTrigger>
              <TabsTrigger value="routines" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <TableIcon className="mr-2 h-4 w-4" /> Class Routines
              </TabsTrigger>
              <TabsTrigger value="promotion" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <ArrowUpCircle className="mr-2 h-4 w-4" /> Promotion
              </TabsTrigger>
              <TabsTrigger value="permissions" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <Shield className="mr-2 h-4 w-4" /> Permissions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>Log out</Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <span className="font-bold text-lg text-school-primary">Admin Portal</span>
          <div className="flex items-center gap-2">
            {/* Could add quick action or profile icon here */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">
          <DashboardHeader
            title={
              activeTab === 'announcements' ? 'Manage Announcements' :
                activeTab === 'staff' ? 'Manage Staff' :
                  activeTab === 'students' ? 'Manage Students' :
                    activeTab === 'fees' ? 'Fee Management' :
                      activeTab === 'calendar' ? 'Calendar Events' :
                        activeTab === 'resources' ? 'Resource Management' :
                          'Student Results'
            }
            subtitle={
              activeTab === 'announcements' ? 'Create and manage school announcements' :
                activeTab === 'staff' ? 'Manage teacher and staff profiles' :
                  activeTab === 'students' ? 'Add, edit, or bulk import students' :
                    activeTab === 'fees' ? 'Manage fee structures and collect payments' :
                      activeTab === 'admissions' ? 'Review and process admission requests' :
                        activeTab === 'calendar' ? 'Manage academic calendar events and holidays' :
                          activeTab === 'resources' ? 'Upload policies, forms, and other documents' :
                            activeTab === 'routines' ? 'Manage class timetables and schedules' :
                              'Manage examination results and reports'
            }
            onLogout={handleLogout}
            showLogout={false}
          />

          <Tabs value={activeTab} className="mt-6 space-y-4 border-none">
            <TabsContent value="announcements" className="space-y-4 border-none p-0 outline-none">
              <AnnouncementToolbar searchTerm={searchTerm} onSearchChange={handleSearchChange} onCreateClick={handleCreateClick} />
              <AnnouncementTable announcements={filteredAnnouncements} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            </TabsContent>
            <TabsContent value="staff" className="space-y-4 border-none p-0 outline-none"><StaffManagement /></TabsContent>
            <TabsContent value="students" className="space-y-4 border-none p-0 outline-none"><StudentManagement /></TabsContent>
            <TabsContent value="fees" className="space-y-4 border-none p-0 outline-none"><FeeManagement /></TabsContent>
            <TabsContent value="admissions" className="space-y-4 border-none p-0 outline-none"><AdmissionManagement hideHeader={true} /></TabsContent>
            <TabsContent value="results" className="space-y-4 border-none p-0 outline-none"><StudentResults hideHeader={true} /></TabsContent>
            <TabsContent value="exams" className="space-y-4 border-none p-0 outline-none"><ExamManagement /></TabsContent>
            <TabsContent value="marks" className="space-y-4 border-none p-0 outline-none"><MarksEntry /></TabsContent>
            <TabsContent value="calendar" className="space-y-4 border-none p-0 outline-none"><EventManagement /></TabsContent>
            <TabsContent value="resources" className="space-y-4 border-none p-0 outline-none"><ResourceManagement hideHeader={true} /></TabsContent>
            <TabsContent value="attendance" className="space-y-4 border-none p-0 outline-none"><AttendancePage /></TabsContent>
            <TabsContent value="routines" className="space-y-4 border-none p-0 outline-none"><RoutineManagement /></TabsContent>
            <TabsContent value="promotion" className="space-y-4 border-none p-0 outline-none"><PromotionManagement /></TabsContent>
            <TabsContent value="permissions" className="space-y-4 border-none p-0 outline-none"><PermissionManagement /></TabsContent>
          </Tabs>
        </main>
      </div>

      <AnnouncementDialog isOpen={isFormOpen} onOpenChange={setIsFormOpen} selectedAnnouncement={selectedAnnouncement} onSuccess={handleFormSuccess} />
      <DeleteAnnouncementDialog isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} selectedAnnouncement={selectedAnnouncement} onConfirm={handleDeleteConfirm} />

      {/* Mobile Navigation */}
      <AdminMobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Dashboard;
