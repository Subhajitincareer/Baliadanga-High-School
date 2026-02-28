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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
import CourseMaterialManagement from '@/components/admin/CourseMaterialManagement';
import { EventManagement } from '@/components/admin/EventManagement';
import AttendancePage from '@/pages/admin/AttendancePage';
import PermissionManagement from '@/pages/admin/PermissionManagement';
import { IDCardGenerator } from '@/pages/admin/IDCardGenerator';
import MidDayMealPage from '@/pages/admin/MidDayMealPage';
import PromotionManagement from '@/pages/admin/PromotionManagement';
import { BellRing, Users, GraduationCap, Award, BookOpen, PenTool, UserPlus, FileText, Calendar as CalendarIcon, Table as TableIcon, DollarSign, CheckSquare, Shield, ArrowUpCircle, LayoutTemplate, Utensils, Globe } from 'lucide-react';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { SiteSettingsManagement } from '@/components/admin/SiteSettingsManagement';
import EventsManagement from '@/components/admin/EventsManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [activeTab, setActiveTab] = useState('announcements');
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const { announcements, isLoading, fetchAnnouncements, handleDeleteAnnouncement } = useAnnouncements();

  // Get user role
  const userRole = localStorage.getItem('userRole') || 'admin';

  // Define tab visibility
  const canAccess = (tab: string) => {
    if (userRole === 'admin' || userRole === 'principal') return true;

    const teacherTabs = ['announcements', 'attendance', 'meal', 'calendar', 'results', 'marks', 'exams', 'routines', 'idcards', 'students', 'resources', 'course-materials', 'events', 'gallery'];
    const staffTabs = ['announcements', 'attendance', 'meal', 'fees', 'students', 'idcards', 'admissions', 'resources', 'course-materials', 'events', 'gallery'];

    if (userRole === 'teacher') return teacherTabs.includes(tab);
    if (userRole === 'staff') return staffTabs.includes(tab);

    return false; // Default blocked
  };

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
            <TabsList className="flex h-full flex-col items-start justify-start space-y-1 bg-transparent p-0 w-full">
              <div className="w-full px-3 py-2">
                <TabsTrigger value="announcements" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                  <BellRing className="mr-2 h-4 w-4" /> Announcements
                </TabsTrigger>
              </div>

              <Accordion type="multiple" defaultValue={['people', 'academic', 'management']} className="w-full px-3">
                <AccordionItem value="people" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline text-sm font-semibold text-slate-500 hover:text-slate-800">
                    People
                  </AccordionTrigger>
                  <AccordionContent className="pb-2 pt-1 pl-2">
                    <div className="flex flex-col space-y-1">
                      {canAccess('students') && (
                        <TabsTrigger value="students" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <UserPlus className="mr-2 h-4 w-4" /> Students
                        </TabsTrigger>
                      )}
                      {canAccess('staff') && (
                        <TabsTrigger value="staff" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <Users className="mr-2 h-4 w-4" /> Staff
                        </TabsTrigger>
                      )}
                      {canAccess('idcards') && (
                        <TabsTrigger value="idcards" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <LayoutTemplate className="mr-2 h-4 w-4" /> ID Cards
                        </TabsTrigger>
                      )}
                      {canAccess('permissions') && (
                        <TabsTrigger value="permissions" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <Shield className="mr-2 h-4 w-4" /> Permissions
                        </TabsTrigger>
                      )}
                      {canAccess('promotion') && (
                        <TabsTrigger value="promotion" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <ArrowUpCircle className="mr-2 h-4 w-4" /> Promotion
                        </TabsTrigger>
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
                        <TabsTrigger value="routines" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <TableIcon className="mr-2 h-4 w-4" /> Class Routines
                        </TabsTrigger>
                      )}
                      {canAccess('exams') && (
                        <TabsTrigger value="exams" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <BookOpen className="mr-2 h-4 w-4" /> Exams
                        </TabsTrigger>
                      )}
                      {canAccess('marks') && (
                        <TabsTrigger value="marks" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <PenTool className="mr-2 h-4 w-4" /> Marks Entry
                        </TabsTrigger>
                      )}
                      {canAccess('results') && (
                        <TabsTrigger value="results" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <Award className="mr-2 h-4 w-4" /> Results
                        </TabsTrigger>
                      )}
                      {canAccess('course-materials') && (
                        <TabsTrigger value="course-materials" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <BookOpen className="mr-2 h-4 w-4" /> Course Materials
                        </TabsTrigger>
                      )}
                      {canAccess('calendar') && (
                        <TabsTrigger value="calendar" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
                        </TabsTrigger>
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
                        <TabsTrigger value="fees" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <DollarSign className="mr-2 h-4 w-4" /> Fees
                        </TabsTrigger>
                      )}
                      {canAccess('admissions') && (
                        <TabsTrigger value="admissions" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <GraduationCap className="mr-2 h-4 w-4" /> Admissions
                        </TabsTrigger>
                      )}
                      {canAccess('attendance') && (
                        <TabsTrigger value="attendance" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <CheckSquare className="mr-2 h-4 w-4" /> Attendance
                        </TabsTrigger>
                      )}
                      {canAccess('meal') && (
                        <TabsTrigger value="meal" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <Utensils className="mr-2 h-4 w-4" /> Mid-Day Meal
                        </TabsTrigger>
                      )}
                      {canAccess('resources') && (
                        <TabsTrigger value="resources" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <FileText className="mr-2 h-4 w-4" /> Resources
                        </TabsTrigger>
                      )}
                      {canAccess('events') && (
                        <TabsTrigger value="events" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <CalendarIcon className="mr-2 h-4 w-4" /> Events
                        </TabsTrigger>
                      )}
                      {canAccess('gallery') && (
                        <TabsTrigger value="gallery" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                          <LayoutTemplate className="mr-2 h-4 w-4" /> Gallery
                        </TabsTrigger>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Site Settings — admin/principal only */}
              {canAccess('site-settings') && (
                <div className="w-full px-3 py-2">
                  <TabsTrigger value="site-settings" className="w-full justify-start px-2 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                    <Globe className="mr-2 h-4 w-4" /> Site Settings
                  </TabsTrigger>
                </div>
              )}
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
                          activeTab === 'idcards' ? 'ID Card Generator' :
                            activeTab === 'meal' ? 'Mid-Day Meal Register' :
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
                              activeTab === 'idcards' ? 'Generate and print student ID cards' :
                                activeTab === 'meal' ? 'Track daily student meal consumption' :
                                  'Manage examination results and reports'
            }
            onLogout={handleLogout}
            showLogout={false}
          />

          <Tabs value={activeTab} className="mt-6 space-y-4 border-none">
            <TabsContent value="announcements" className="space-y-4 border-none p-0 outline-none">
              {(userRole === 'admin' || userRole === 'principal') && <DashboardStats />}
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
            <TabsContent value="course-materials" className="space-y-4 border-none p-0 outline-none"><CourseMaterialManagement hideHeader={true} /></TabsContent>
            <TabsContent value="attendance" className="space-y-4 border-none p-0 outline-none"><AttendancePage /></TabsContent>
            <TabsContent value="routines" className="space-y-4 border-none p-0 outline-none"><RoutineManagement /></TabsContent>
            <TabsContent value="promotion" className="space-y-4 border-none p-0 outline-none"><PromotionManagement /></TabsContent>
            <TabsContent value="permissions" className="space-y-4 border-none p-0 outline-none"><PermissionManagement /></TabsContent>
            <TabsContent value="idcards" className="space-y-4 border-none p-0 outline-none"><IDCardGenerator /></TabsContent>
            <TabsContent value="meal" className="space-y-4 border-none p-0 outline-none"><MidDayMealPage /></TabsContent>
            <TabsContent value="site-settings" className="space-y-4 border-none p-0 outline-none"><SiteSettingsManagement /></TabsContent>
            <TabsContent value="events" className="space-y-4 border-none p-0 outline-none"><EventsManagement /></TabsContent>
            <TabsContent value="gallery" className="space-y-4 border-none p-0 outline-none"><GalleryManagement /></TabsContent>
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
