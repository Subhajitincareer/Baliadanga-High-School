import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Bell, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import apiService, { Announcement } from '@/services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getAnnouncements();
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center text-red-500">
        <AlertCircle className="mb-2 h-8 w-8" />
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Announcements & Notices</h1>
          <p className="text-lg text-muted-foreground">Stay updated with the latest information from Baliadanga High School</p>
        </div>

        {isAdmin && (
          <Link to="/admin/dashboard">
            <Button
              className="mt-4 bg-school-primary hover:bg-school-primary/90 md:mt-0"
            >
              Manage Announcements
            </Button>
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
          <p>No announcements found at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <Card key={announcement._id} className="border-t-4 border-t-school-primary transition-all duration-300 hover:shadow-lg flex flex-col">
              <CardHeader>
                <div className="mb-2 flex items-center text-sm text-muted-foreground">
                  <Calendar size={16} className="mr-1" />
                  <time dateTime={announcement.publishDate}>
                    {announcement.publishDate ? new Date(announcement.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </time>
                </div>
                <CardTitle className="text-xl line-clamp-2" title={announcement.title}>{announcement.title}</CardTitle>
                <div className="mt-2 inline-flex items-center rounded-full bg-school-light px-2.5 py-0.5 text-xs font-semibold text-school-primary w-fit">
                  <Bell size={12} className="mr-1" />
                  {announcement.category}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div
                  className="text-muted-foreground line-clamp-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: announcement.content.length > 200
                      ? `${announcement.content.substring(0, 200)}...`
                      : announcement.content
                  }}
                />

                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="mt-4">
                    {announcement.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        download={file.filename}
                        className="mb-2 inline-flex items-center rounded-md bg-school-light px-3 py-2 text-sm font-medium text-school-primary hover:bg-school-light/80 w-full justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Download {file.filename.length > 20 ? file.filename.substring(0, 20) + '...' : file.filename}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="mt-auto">
                <Link to={`/announcements/${announcement._id}`} className="w-full">
                  <Button variant="ghost" className="w-full text-school-primary hover:bg-school-light hover:text-school-primary">
                    Read More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
