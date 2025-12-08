import React, { useState, useCallback, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
}
  from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';

import { EVENT_TYPES } from '@/components/calendar/EventTypes'; // Still use EVENT_TYPES for color mapping
import CalendarDayComponent from '@/components/calendar/CalendarDayComponent';
import EventDetailCard from '@/components/calendar/EventDetailCard';
import MonthlyEventsList from '@/components/calendar/MonthlyEventsList';
import AcademicYearDates from '@/components/calendar/AcademicYearDates';

import type { DayProps } from 'react-day-picker';
import apiService, { CalendarEvent as ApiCalendarEvent } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Helper to map API event to component event structure
const mapApiEventToCalendarEvent = (apiEvent: ApiCalendarEvent) => {
  const typeKey = apiEvent.type as keyof typeof EVENT_TYPES;
  const eventType = EVENT_TYPES[typeKey] || EVENT_TYPES.ACTIVITY; // Fallback

  return {
    date: new Date(apiEvent.date),
    title: apiEvent.title,
    type: eventType,
    description: apiEvent.description,
    startTime: apiEvent.startTime,
    endTime: apiEvent.endTime,
    endDate: apiEvent.endDate // Pass through end date
  };
};

const AcademicCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]); // Using any[] to match specific local interfaces if needed, or map properly
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filter, setFilter] = useState<string>('all');

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getEvents();
      // data might be array or { data: [] }
      const eventsList = Array.isArray(data) ? data : (data as any).data || [];

      const mappedEvents = eventsList.map(mapApiEventToCalendarEvent);
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Failed to fetch calendar events', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month.getMonth());
    setSelectedYear(month.getFullYear());
  };

  // Use useCallback to memoize the custom day render function
  const customDayRender = useCallback(
    (dayProps: DayProps) => {
      // Pass the props and your events to your custom day component
      return <CalendarDayComponent props={dayProps} events={events} />;
    },
    [events]
  );

  return (
    <div className="container py-10 max-w-7xl mx-auto px-4">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="font-heading mb-2 text-4xl font-extrabold text-school-primary tracking-wide">
          Academic Calendar
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          View important academic dates, holidays, exams, and school events
        </p>
      </header>

      {/* Main content grid */}
      <main className="flex justify-center items-start">
        <div className="w-full max-w-6xl">
          <div className="grid gap-10 md:grid-cols-5">
            {/* Calendar + Event Details */}
            <Card className="md:col-span-2 shadow-lg border-2 border-school-light/50 rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-school-light/10 pb-3 rounded-t-lg">
                <CardTitle className="flex items-center text-xl font-semibold text-school-primary select-none">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Calendar View
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Select a date to view events
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center px-4 pt-4 pb-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  onMonthChange={handleMonthChange}
                  className="rounded-md border border-gray-300 shadow-sm w-full max-w-md"
                  components={{
                    Day: customDayRender,
                  }}
                />
              </CardContent>

              {/* Event Details panel */}
              {date && (
                <div className="p-4 border-t border-school-light/30 bg-white">
                  <EventDetailCard date={date} events={events} />
                </div>
              )}
            </Card>

            {/* Monthly Events List */}
            <Card className="md:col-span-3 shadow-lg border-2 border-school-light/50 rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-school-light/10">
                <MonthlyEventsList
                  events={events}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  filter={filter}
                  setFilter={setFilter}
                />
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      {/* Academic Year Dates Section */}
      <section className="mt-16">
        <AcademicYearDates events={events} />
      </section>
    </div>
  );
};

export default AcademicCalendar;
