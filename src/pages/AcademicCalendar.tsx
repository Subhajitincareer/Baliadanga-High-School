
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';

// Import our refactored components
import { generateEvents } from '@/components/calendar/EventTypes';
import CalendarDayComponent from '@/components/calendar/CalendarDayComponent';
import EventDetailCard from '@/components/calendar/EventDetailCard';
import MonthlyEventsList from '@/components/calendar/MonthlyEventsList';
import AcademicYearDates from '@/components/calendar/AcademicYearDates';

const AcademicCalendar = () => {
  const events = generateEvents();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filter, setFilter] = useState<string>("all");
  
  // Handle month change in the calendar
  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month.getMonth());
    setSelectedYear(month.getFullYear());
  };
  
  // Custom day rendering for the calendar
  const customDayRender = (props: any) => {
    return <CalendarDayComponent props={props} events={events} />;
  };
  
  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Academic Calendar</h1>
        <p className="text-lg text-muted-foreground">
          View important academic dates, holidays, exams, and school events
        </p>
      </div>
      
      <div className="flex justify-center items-center">
        <div className="w-full max-w-4xl">
          <div className="grid gap-8 md:grid-cols-5">
            <Card className="md:col-span-2 shadow-lg border-2 border-school-light/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5 text-school-primary" />
                  Calendar View
                </CardTitle>
                <CardDescription>Select a date to view events</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  onMonthChange={handleMonthChange}
                  className="rounded-md border shadow-sm"
                  components={{
                    Day: customDayRender
                  }}
                />
              </CardContent>
              
              {date && (
                <div className="p-4">
                  <EventDetailCard date={date} events={events} />
                </div>
              )}
            </Card>
            
            <Card className="md:col-span-3 shadow-lg border-2 border-school-light/50">
              <CardHeader>
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
      </div>
      
      <AcademicYearDates />
    </div>
  );
};

export default AcademicCalendar;
