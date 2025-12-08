
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Bell, FileText } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Announcement } from '@/components/admin/AnnouncementForm';

const defaultAnnouncements: Announcement[] = [
  {
    _id: "1",
    title: "Annual Sports Day",
    publishDate: "2025-04-15",
    category: "Event",
    content: "The annual sports day will be held on April 15th. All students are encouraged to participate in various sports activities. Parents are invited to attend and support their children. Please ensure your child wears appropriate sports attire on the day.",
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
    content: "Parent-teacher meeting for all classes will be held on April 20th from 10:00 AM to 2:00 PM. Parents are requested to attend without fail to discuss their child's academic progress. Please bring the student diary and progress report.",
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
    content: "Science exhibition for classes 8-10 will be organized on May 5th. Students should submit their project proposals by April 25th. The theme for this year's exhibition is 'Sustainable Development and Innovation'.",
    targetAudience: "Students",
    priority: "Medium",
    authorId: "1",
    authorName: "Admin"
  },
  {
    _id: "4",
    title: "School Closed for Elections",
    publishDate: "2025-04-10",
    category: "General",
    content: "The school will remain closed on April 10th due to municipal elections as the school premises will be used as a polling booth. Regular classes will resume from April 11th.",
    targetAudience: "All",
    priority: "High",
    authorId: "1",
    authorName: "Admin"
  },
  {
    _id: "5",
    title: "Summer Vacation Schedule",
    publishDate: "2025-05-20",
    category: "General",
    content: "The summer vacation will commence from May 20th and the school will reopen on June 15th. Students are advised to complete their holiday homework during the vacation period.",
    targetAudience: "Students",
    priority: "Medium",
    authorId: "1",
    authorName: "Admin"
  },
  {
    _id: "6",
    title: "Annual Cultural Program",
    publishDate: "2025-05-25",
    category: "Event",
    content: "The annual cultural program 'Unity in Diversity' will be held on May 25th at 5:00 PM in the school auditorium. Parents are cordially invited to attend the event and encourage our students.",
    targetAudience: "All",
    priority: "Medium",
    authorId: "1",
    authorName: "Admin"
  }
];

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    // Load announcements from localStorage if available
    const storedAnnouncements = localStorage.getItem('announcements');
    if (storedAnnouncements) {
      setAnnouncements(JSON.parse(storedAnnouncements));
    }
  }, []);

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
              <p className="text-muted-foreground">
                {announcement.content.length > 150 ?
                  `${announcement.content.substring(0, 150)}...` : announcement.content}
              </p>

              {announcement.pdfFile && (
                <div className="mt-4">
                  <a
                    href={announcement.pdfFile.data}
                    download={announcement.pdfFile.name}
                    className="inline-flex items-center rounded-md bg-school-light px-3 py-2 text-sm font-medium text-school-primary hover:bg-school-light/80"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
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
  );
};

export default Announcements;
