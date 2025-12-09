import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, FileText, ArrowLeft, Loader2, AlertCircle, Eye } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import apiService, { Announcement } from '@/services/api';

const AnnouncementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const announcements = await apiService.getAnnouncements();
        const found = announcements.find(a => a._id === id);

        if (found) {
          setAnnouncement(found);
        } else {
          setError('Announcement not found');
        }
      } catch (err) {
        console.error("Error fetching announcement:", err);
        setError("Failed to load announcement details");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Announcement Not Found</h1>
        <p className="text-muted-foreground mb-4">{error || "The announcement you're looking for doesn't exist or has been removed."}</p>
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
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/announcements">Announcements</Link>
            </BreadcrumbLink>
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
              <time dateTime={announcement.publishDate}>
                {announcement.publishDate ? new Date(announcement.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </time>
            </div>
            <div className="inline-flex items-center rounded-full bg-school-light px-2.5 py-1 text-xs font-semibold text-school-primary">
              <Bell size={12} className="mr-1" />
              {announcement.category}
            </div>
          </div>
          <CardTitle className="text-3xl">{announcement.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: announcement.content }} className="text-lg text-foreground leading-relaxed" />
          </div>

          {/* Attachments Section with Inline PDF Viewer */}
          {announcement.attachments && announcement.attachments.map((file, idx) => (
            <div key={idx} className="mt-8 border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
                <div className="flex items-center font-medium">
                  <FileText className="mr-2 h-4 w-4" />
                  {file.filename}
                </div>
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    download={file.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90"
                  >
                    Download
                  </a>
                </div>
              </div>

              {/* PDF Previewer Logic */}
              {(file.mimetype === 'application/pdf' || file.url.endsWith('.pdf') || file.url.startsWith('data:application/pdf')) ? (
                <div className="w-full h-[600px] bg-slate-50 flex items-center justify-center relative">
                  {/* Using Google Docs Viewer for remote URLs or direct embed for data URIs/local */}
                  {/* Note: Data URIs might be heavy for iframe src depending on browser limit, but often work */}
                  {file.url.startsWith('data:') ? (
                    <iframe
                      src={file.url}
                      className="w-full h-full"
                      title={file.filename}
                    />
                  ) : (
                    /* Fallback for remote URLs often needs a viewer if CORS is an issue, 
                       but for same-origin or public URLs, direct embed usually works if browser supports PDF */
                    <iframe
                      src={`${file.url}#toolbar=0`}
                      className="w-full h-full"
                      title={file.filename}
                    />
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Preview not available for this file type.</p>
                  <a href={file.url} download className="underline text-primary cursor-pointer mt-2 block">Download to view</a>
                </div>
              )}
            </div>
          ))}

          <div className="pt-6 border-t mt-4">
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
