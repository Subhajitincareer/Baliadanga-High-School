
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
import { BellRing, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
  }, [isAdmin, navigate]);

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.type.toLowerCase().includes(searchTerm.toLowerCase())
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
    fetchAnnouncements(); // Refresh announcements from the server
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleAdmissionsClick = () => {
    navigate('/admin/admissions');
  };

  return (
    <div className="container py-8">
      <DashboardHeader 
        title="School Administration" 
        subtitle="Manage content for the school website" 
        onLogout={handleLogout}
      />

      <div className="mt-6 mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => setActiveTab('announcements')}
        >
          <BellRing className="h-6 w-6 text-primary" />
          <span>Manage Announcements</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={() => setActiveTab('staff')}
        >
          <Users className="h-6 w-6 text-primary" />
          <span>Manage Staff</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
          onClick={handleAdmissionsClick}
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>Manage Admissions</span>
        </Button>
      </div>

      <Tabs defaultValue="announcements" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="announcements" className="flex items-center justify-center">
            <BellRing className="mr-2 h-4 w-4" />
            <span>Announcements</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center justify-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Staff Directory</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements" className="mt-0">
          <AnnouncementToolbar 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onCreateClick={handleCreateClick}
          />

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <p>Loading announcements...</p>
            </div>
          ) : (
            <AnnouncementTable 
              announcements={filteredAnnouncements} 
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </TabsContent>
        
        <TabsContent value="staff" className="mt-0">
          <StaffManagement />
        </TabsContent>
      </Tabs>

      {/* Announcement Form Dialog */}
      <AnnouncementDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        selectedAnnouncement={selectedAnnouncement}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAnnouncementDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedAnnouncement={selectedAnnouncement}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Dashboard;
