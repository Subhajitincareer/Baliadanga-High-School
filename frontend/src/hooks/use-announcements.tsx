import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Announcement } from '@/components/admin/AnnouncementForm';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      const data = await apiService.getAnnouncements();

      // Optional: Process the data if your MongoDB model uses _id
      const processedData: Announcement[] = data.map((item: any) => ({
        ...item,
        _id: item._id || item.id,
        category: item.category || item.type || 'General', // Fallback to ensure category exists
        publishDate: item.publishDate || item.date || new Date().toISOString(),
        pdfFile:
          item.pdf_url || item.pdfFile
            ? typeof item.pdf_url === 'string'
              ? JSON.parse(item.pdf_url)
              : item.pdfFile
            : undefined,
      }));

      setAnnouncements(processedData);

      // Update localStorage for offline fallback
      localStorage.setItem('announcements', JSON.stringify(processedData));
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements.',
        variant: 'destructive',
      });

      // Fallback to localStorage if fetch fails
      const storedAnnouncements = localStorage.getItem('announcements');
      if (storedAnnouncements) {
        setAnnouncements(JSON.parse(storedAnnouncements));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    try {
      await apiService.deleteAnnouncement(announcement._id!);

      // Update local state
      const updated = announcements.filter(
        a => a._id !== announcement._id
      );
      setAnnouncements(updated);

      // Update localStorage for offline cache
      localStorage.setItem('announcements', JSON.stringify(updated));

      toast({
        title: 'Announcement deleted',
        description: 'The announcement has been deleted successfully.',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the announcement.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    isLoading,
    fetchAnnouncements,
    handleDeleteAnnouncement,
  };
}
