
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

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
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

  return (
    <div className="container py-8">
      <DashboardHeader 
        title="School Announcements" 
        subtitle="Manage notices and events for the school website" 
        onLogout={handleLogout}
      />

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
