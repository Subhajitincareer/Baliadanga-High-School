
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAdmin } from '@/contexts/AdminContext';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { AnnouncementTable } from '@/components/admin/AnnouncementTable';
import { AnnouncementToolbar } from '@/components/admin/AnnouncementToolbar';
import AnnouncementForm, { Announcement } from '@/components/admin/AnnouncementForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    // Fetch announcements from Supabase
    fetchAnnouncements();
  }, [isAdmin, navigate]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Process data to match our Announcement interface
        const processedData = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type,
          date: item.date,
          pdfFile: item.pdf_url ? JSON.parse(item.pdf_url) : undefined
        }));

        setAnnouncements(processedData);
        
        // Also update localStorage for the frontend components
        localStorage.setItem('announcements', JSON.stringify(processedData));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements.',
        variant: 'destructive',
      });
      
      // Fallback to localStorage if supabase fails
      const storedAnnouncements = localStorage.getItem('announcements');
      if (storedAnnouncements) {
        setAnnouncements(JSON.parse(storedAnnouncements));
      }
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', selectedAnnouncement.id);

      if (error) throw error;

      // Update local state
      setAnnouncements(announcements.filter(a => a.id !== selectedAnnouncement.id));
      
      // Update localStorage
      localStorage.setItem('announcements', JSON.stringify(
        announcements.filter(a => a.id !== selectedAnnouncement.id)
      ));

      toast({
        title: 'Announcement deleted',
        description: 'The announcement has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the announcement.',
        variant: 'destructive',
      });
    } finally {
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
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm 
            announcement={selectedAnnouncement || undefined} 
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the announcement "{selectedAnnouncement?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
