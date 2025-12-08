import React, { useState, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';

import { generateEvents } from '@/components/calendar/EventTypes';
import CalendarDayComponent from '@/components/calendar/CalendarDayComponent';
import EventDetailCard from '@/components/calendar/EventDetailCard';
import MonthlyEventsList from '@/components/calendar/MonthlyEventsList';
import AcademicYearDates from '@/components/calendar/AcademicYearDates';

// Import DayPickerDayProps type if possible from react-day-picker for better typing
import type { DayProps } from 'react-day-picker';

const AcademicCalendar: React.FC = () => {
  const events = generateEvents();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filter, setFilter] = useState<string>('all');

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
        <AcademicYearDates />
      </section>
    </div>
  );
};

export default AcademicCalendar;
