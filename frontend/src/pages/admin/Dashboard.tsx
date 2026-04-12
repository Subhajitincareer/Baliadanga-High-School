import React, { useState } from 'react';
import { AnnouncementTable } from '@/components/admin/AnnouncementTable';
import { AnnouncementToolbar } from '@/components/admin/AnnouncementToolbar';
import { Announcement } from '@/components/admin/AnnouncementForm';
import { AnnouncementDialog } from '@/components/admin/AnnouncementDialog';
import { DeleteAnnouncementDialog } from '@/components/admin/DeleteAnnouncementDialog';
import { useAnnouncements } from '@/hooks/use-announcements';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * AdminDashboardPage - Main summary page for administrators.
 * Shows quick stats and provides announcement management.
 */
const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const { announcements, isLoading, fetchAnnouncements, handleDeleteAnnouncement } = useAnnouncements();

  // Get user role for stats visibility
  const userRole = localStorage.getItem('userRole') || 'admin';
  const showStats = userRole === 'admin' || userRole === 'principal';

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner text="Loading announcements..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Summary Stats */}
      {showStats && <DashboardStats />}

      {/* Announcement Management Section */}
      <div className="space-y-4">
        <AnnouncementToolbar 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
          onCreateClick={handleCreateClick} 
        />
        <AnnouncementTable 
          announcements={filteredAnnouncements} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick} 
        />
      </div>

      {/* Dialogs */}
      <AnnouncementDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        selectedAnnouncement={selectedAnnouncement} 
        onSuccess={handleFormSuccess} 
      />
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
