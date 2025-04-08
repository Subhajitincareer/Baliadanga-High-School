
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, FileText, ArrowLeft } from 'lucide-react';
import { Announcement } from '@/components/admin/AnnouncementForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

const AnnouncementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load announcements from localStorage
    const fetchAnnouncement = () => {
      setLoading(true);
      const storedAnnouncements = localStorage.getItem('announcements');
      
      if (storedAnnouncements) {
        const announcements: Announcement[] = JSON.parse(storedAnnouncements);
        const foundAnnouncement = announcements.find(a => a.id === id);
        
        if (foundAnnouncement) {
          setAnnouncement(foundAnnouncement);
        }
      } else {
        // Try to find in default announcements (for demo purposes)
        const defaultAnnouncements = [
          {
            id: "1",
            title: "Annual Sports Day",
            date: "2025-04-15",
            type: "Event",
            content: "The annual sports day will be held on April 15th. All students are encouraged to participate in various sports activities. Parents are invited to attend and support their children. Please ensure your child wears appropriate sports attire on the day."
          },
          {
            id: "2",
            title: "Parent-Teacher Meeting",
            date: "2025-04-20",
            type: "Notice",
            content: "Parent-teacher meeting for all classes will be held on April 20th from 10:00 AM to 2:00 PM. Parents are requested to attend without fail to discuss their child's academic progress. Please bring the student diary and progress report."
          },
          {
            id: "3",
            title: "Science Exhibition",
            date: "2025-05-05",
            type: "Event",
            content: "Science exhibition for classes 8-10 will be organized on May 5th. Students should submit their project proposals by April 25th. The theme for this year's exhibition is 'Sustainable Development and Innovation'."
          }
        ];
        
        const foundAnnouncement = defaultAnnouncements.find(a => a.id === id);
        if (foundAnnouncement) {
          setAnnouncement(foundAnnouncement);
        }
      }
      setLoading(false);
    };

    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Announcement Not Found</h1>
        <p className="text-muted-foreground mb-4">The announcement you're looking for doesn't exist or has been removed.</p>
        <Link to="/announcements">
          <Button>
            <ArrowLeft className="mr-2" />
            Back to Announcements
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/announcements">Announcements</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{announcement.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-t-4 border-t-school-primary">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={16} className="mr-1" />
              <time dateTime={announcement.date}>
                {new Date(announcement.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
            </div>
            <div className="inline-flex items-center rounded-full bg-school-light px-2.5 py-1 text-xs font-semibold text-school-primary">
              <Bell size={12} className="mr-1" />
              {announcement.type}
            </div>
          </div>
          <CardTitle className="text-3xl">{announcement.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p className="text-lg text-foreground leading-relaxed">{announcement.content}</p>
          </div>
          
          {announcement.pdfFile && (
            <div className="pt-4">
              <a 
                href={announcement.pdfFile.data}
                download={announcement.pdfFile.name}
                className="inline-flex items-center rounded-md bg-school-light px-4 py-2 text-sm font-medium text-school-primary hover:bg-school-light/80"
              >
                <FileText className="mr-2 h-5 w-5" />
                Download Attachment
              </a>
            </div>
          )}
          
          <div className="pt-6 border-t">
            <Link to="/announcements">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Announcements
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementDetail;
