
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Bell, FileText } from 'lucide-react';
import { Announcement } from '@/components/admin/AnnouncementForm';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const defaultAnnouncements: Announcement[] = [
  {
    _id: "1",
    title: "Annual Sports Day",
    publishDate: "2025-04-15",
    category: "Event",
    content: "The annual sports day will be held on April 15th. All students are encouraged to participate in various sports activities.",
    targetAudience: "All",
    priority: "Medium",
    authorId: "1",
    authorName: "Admin"
  },
  {
    _id: "2",
    title: "Parent-Teacher Meeting",
    publishDate: "2025-04-20",
    category: "General",
    content: "Parent-teacher meeting for all classes will be held on April 20th from 10:00 AM to 2:00 PM.",
    targetAudience: "Parents",
    priority: "High",
    authorId: "1",
    authorName: "Admin"
  },
  {
    _id: "3",
    title: "Science Exhibition",
    publishDate: "2025-05-05",
    category: "Event",
    content: "Science exhibition for classes 8-10 will be organized on May 5th. Students should submit their project proposals by April 25th.",
    targetAudience: "Students",
    priority: "Medium",
    authorId: "1",
    authorName: "Admin"
  }
];

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, fileName: string) => {
    try {
      setDownloadingId(id);
      toast({ title: 'Downloading PDF...', description: 'Please wait...', duration: 2000 });
      const full = await apiService.getAnnouncementById(id);
      
      let pdfData = full.pdfFile?.data;
      if (!pdfData && full.pdf_url) {
         const parsed = typeof full.pdf_url === 'string' ? JSON.parse(full.pdf_url) : full.pdf_url;
         pdfData = parsed.data;
      }
      if (!pdfData && full.attachments && full.attachments.length > 0) {
         pdfData = full.attachments[0].url;
      }

      if (!pdfData) {
         toast({ title: 'Error', description: 'No PDF data found in this announcement.', variant: 'destructive' });
         return;
      }

      const link = document.createElement('a');
      link.href = pdfData;
      link.download = fileName || 'announcement.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: 'Error', description: 'Failed to download the PDF.', variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    // Load announcements from localStorage if available
    const storedAnnouncements = localStorage.getItem('announcements');
    if (storedAnnouncements) {
      const allAnnouncements = JSON.parse(storedAnnouncements);
      // Only show the latest 3 announcements on the home page
      setAnnouncements(allAnnouncements.slice(0, 3));
    }
  }, []);

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-school-primary text-center md:text-left">Latest Announcements</h2>
          <Link to="/announcements">
            <Button variant="outline" className="border-school-primary text-school-primary hover:bg-school-primary hover:text-white">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <Card key={announcement._id} className="border-t-4 border-t-school-primary transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-center text-sm text-muted-foreground">
                  <Calendar size={16} className="mr-1" />
                  <time dateTime={announcement.publishDate}>
                    {new Date(announcement.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                <div className="inline-flex items-center rounded-full bg-school-light px-2.5 py-0.5 text-xs font-semibold text-school-primary">
                  <Bell size={12} className="mr-1" />
                  {announcement.category}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  {/* Truncate content specifically and handle HTML stripping if needed, but for now simple text */}
                  {announcement.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}
                  {announcement.content.replace(/<[^>]*>?/gm, '').length > 120 ? '...' : ''}
                </div>

                {announcement.pdfFile && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      disabled={downloadingId === announcement._id}
                      onClick={(e) => {
                        e.preventDefault();
                        if (announcement._id) handleDownload(announcement._id, announcement.pdfFile!.name);
                      }}
                      className="inline-flex items-center rounded-md bg-school-light px-3 py-2 text-sm font-medium text-school-primary hover:bg-school-light/80 hover:text-school-primary border-none"
                    >
                      {downloadingId === announcement._id ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-school-primary border-t-transparent" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" />
                      )}
                      {downloadingId === announcement._id ? 'Downloading...' : 'Download PDF'}
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link to={`/announcements/${announcement._id}`}>
                  <Button variant="ghost" className="text-school-primary hover:bg-school-light hover:text-school-primary">
                    Read More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementSection;
