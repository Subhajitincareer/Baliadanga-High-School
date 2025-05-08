
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Announcement } from '@/components/admin/AnnouncementForm';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
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

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcement.id); // Using string ID

      if (error) throw error;

      // Update local state
      setAnnouncements(announcements.filter(a => a.id !== announcement.id));
      
      // Update localStorage
      localStorage.setItem('announcements', JSON.stringify(
        announcements.filter(a => a.id !== announcement.id)
      ));

      toast({
        title: 'Announcement deleted',
        description: 'The announcement has been deleted successfully.',
      });
      
      return true;
    } catch (error) {
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
    handleDeleteAnnouncement
  };
}
