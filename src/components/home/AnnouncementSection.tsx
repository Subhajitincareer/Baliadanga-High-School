
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Bell } from 'lucide-react';

const announcements = [
  {
    id: 1,
    title: "Annual Sports Day",
    date: "2025-04-15",
    type: "Event",
    description: "The annual sports day will be held on April 15th. All students are encouraged to participate in various sports activities."
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    date: "2025-04-20",
    type: "Notice",
    description: "Parent-teacher meeting for all classes will be held on April 20th from 10:00 AM to 2:00 PM."
  },
  {
    id: 3,
    title: "Science Exhibition",
    date: "2025-05-05",
    type: "Event",
    description: "Science exhibition for classes 8-10 will be organized on May 5th. Students should submit their project proposals by April 25th."
  }
];

const AnnouncementSection = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-heading text-3xl font-bold text-school-primary">Latest Announcements</h2>
          <Link to="/announcements">
            <Button variant="outline" className="border-school-primary text-school-primary hover:bg-school-primary hover:text-white">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="border-t-4 border-t-school-primary transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-center text-sm text-muted-foreground">
                  <Calendar size={16} className="mr-1" />
                  <time dateTime={announcement.date}>
                    {new Date(announcement.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                </div>
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                <div className="inline-flex items-center rounded-full bg-school-light px-2.5 py-0.5 text-xs font-semibold text-school-primary">
                  <Bell size={12} className="mr-1" />
                  {announcement.type}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{announcement.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="text-school-primary hover:bg-school-light hover:text-school-primary">
                  Read More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementSection;
