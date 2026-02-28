import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService, { EventItem } from '@/services/api';

const FeaturedEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getSchoolEvents();
        if (res.success) {
          const today = new Date().toISOString().split('T')[0];
          // Show only upcoming events, max 3
          const upcoming = res.data
            .filter(e => e.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3);
          setEvents(upcoming);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  // Don't render the section at all if no upcoming events
  if (!loading && events.length === 0) return null;

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

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col">
                <div className="h-48 overflow-hidden bg-gray-100">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <time dateTime={event.date}>
                        {new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                    </div>
                    {event.time && (
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  {event.description && <p className="line-clamp-2 text-muted-foreground">{event.description}</p>}
                </CardContent>
                <CardFooter>
                  <Link to="/events">
                    <Button variant="ghost" className="text-school-primary hover:bg-school-light hover:text-school-primary">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
