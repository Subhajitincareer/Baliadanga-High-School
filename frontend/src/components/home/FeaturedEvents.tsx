
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const events = [
  {
    id: 1,
    title: "Annual Science Exhibition",
    date: "2025-05-05",
    time: "9:00 AM - 4:00 PM",
    location: "School Auditorium",
    description: "Showcasing innovative science projects by our students across all grades",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 2,
    title: "Inter-School Cricket Tournament",
    date: "2025-05-12",
    time: "10:00 AM - 5:00 PM",
    location: "School Playground",
    description: "Annual cricket tournament featuring top schools from the district",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 3,
    title: "Cultural Program: Unity in Diversity",
    date: "2025-05-25",
    time: "5:00 PM - 8:00 PM",
    location: "School Auditorium",
    description: "Celebrating India's rich cultural heritage through music, dance and drama",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
];

const FeaturedEvents = () => {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-school-primary text-center md:text-left">Upcoming Events</h2>
          <Link to="/events">
            <Button variant="outline" className="border-school-primary text-school-primary hover:bg-school-primary hover:text-white">
              View All Events
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <time dateTime={event.date}>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p className="line-clamp-2 text-muted-foreground">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="text-school-primary hover:bg-school-light hover:text-school-primary">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
