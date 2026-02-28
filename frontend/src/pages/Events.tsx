import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, Search, Loader2, ImageOff } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService, { EventItem } from '@/services/api';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const CATEGORIES = ['All', 'Academic', 'Sports', 'Cultural', 'Administrative', 'Other'] as const;

const Events = () => {
  const [events, setEvents]             = useState<EventItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const { settings } = useSiteSettings();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getSchoolEvents();
        if (res.success) setEvents(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Events Calendar</h1>
        <p className="text-lg text-muted-foreground">Stay updated with all the events and important dates at {settings.schoolInfo.name}</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchInput
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={Search}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c === 'All' ? 'All Categories' : c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-lg bg-gray-50 p-12 text-center border border-dashed">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500 font-medium">No events found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {events.length === 0 ? 'Events will appear here once admin adds them.' : 'Try changing your search or filter.'}
          </p>
          {events.length > 0 && (
            <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}>
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <Card key={event._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col">
              <div className="h-48 overflow-hidden bg-gray-100">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={e => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="inline-flex items-center rounded-full bg-school-light px-2.5 py-0.5 text-xs font-semibold text-school-primary w-fit">
                  {event.category}
                </div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon size={16} className="mr-2" />
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
                {event.description && <p className="line-clamp-3 text-muted-foreground text-sm">{event.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
