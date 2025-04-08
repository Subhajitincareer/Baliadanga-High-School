
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, BookOpen, Award, User } from 'lucide-react';

// Define calendar event types and their corresponding colors
const EVENT_TYPES = {
  HOLIDAY: { label: "Holiday", color: "bg-red-100 text-red-800 border-red-200" },
  EXAM: { label: "Exam", color: "bg-amber-100 text-amber-800 border-amber-200" },
  ACTIVITY: { label: "Activity", color: "bg-blue-100 text-blue-800 border-blue-200" },
  MEETING: { label: "Meeting", color: "bg-purple-100 text-purple-800 border-purple-200" }
};

// Sample calendar events for the current year
const generateEvents = () => {
  const currentYear = new Date().getFullYear();
  
  return [
    { 
      date: new Date(currentYear, 3, 15), 
      title: "Annual Sports Day",
      type: EVENT_TYPES.ACTIVITY
    },
    { 
      date: new Date(currentYear, 3, 20), 
      title: "Parent-Teacher Meeting",
      type: EVENT_TYPES.MEETING
    },
    { 
      date: new Date(currentYear, 4, 1), 
      title: "Labor Day Holiday",
      type: EVENT_TYPES.HOLIDAY
    },
    { 
      date: new Date(currentYear, 4, 5), 
      title: "Science Exhibition",
      type: EVENT_TYPES.ACTIVITY
    },
    { 
      date: new Date(currentYear, 4, 10), 
      title: "Mid-term Exams Begin",
      type: EVENT_TYPES.EXAM
    },
    { 
      date: new Date(currentYear, 4, 20), 
      title: "Mid-term Exams End",
      type: EVENT_TYPES.EXAM
    },
    { 
      date: new Date(currentYear, 5, 5), 
      title: "World Environment Day Celebration",
      type: EVENT_TYPES.ACTIVITY
    },
    { 
      date: new Date(currentYear, 5, 15), 
      title: "Summer Vacation Begins",
      type: EVENT_TYPES.HOLIDAY
    },
    { 
      date: new Date(currentYear, 6, 15), 
      title: "School Reopens",
      type: EVENT_TYPES.ACTIVITY
    },
    { 
      date: new Date(currentYear, 7, 15), 
      title: "Independence Day Celebration",
      type: EVENT_TYPES.HOLIDAY
    },
    { 
      date: new Date(currentYear, 8, 5), 
      title: "Teachers' Day",
      type: EVENT_TYPES.ACTIVITY
    },
    { 
      date: new Date(currentYear, 9, 2), 
      title: "Gandhi Jayanti Holiday",
      type: EVENT_TYPES.HOLIDAY
    },
    { 
      date: new Date(currentYear, 9, 20), 
      title: "Final Exams Begin",
      type: EVENT_TYPES.EXAM
    },
    { 
      date: new Date(currentYear, 10, 5), 
      title: "Final Exams End",
      type: EVENT_TYPES.EXAM
    },
    { 
      date: new Date(currentYear, 10, 15), 
      title: "Annual Day Celebration",
      type: EVENT_TYPES.ACTIVITY
    },
    { 
      date: new Date(currentYear, 11, 20), 
      title: "Winter Vacation Begins",
      type: EVENT_TYPES.HOLIDAY
    }
  ];
};

const AcademicCalendar = () => {
  const events = generateEvents();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filter, setFilter] = useState<string>("all");
  
  // Get all events for the selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Get all events for the selected month
  const getEventsForMonth = () => {
    let filteredEvents = events.filter(event => 
      event.date.getMonth() === selectedMonth && 
      event.date.getFullYear() === selectedYear
    );
    
    if (filter !== "all") {
      filteredEvents = filteredEvents.filter(event => 
        event.type.label.toLowerCase() === filter
      );
    }
    
    return filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  };
  
  // Custom day rendering for the calendar - Fixed to properly handle day props
  const customDayRender = (props: any) => {
    // Check if props and date exist before proceeding
    if (!props || !props.date) {
      return (
        <div className="relative">
          <time>{''}</time>
        </div>
      );
    }
    
    // Get the date from props
    const date = props.date;
    
    // Find events for this date
    const dayEvents = events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
    
    return (
      <div className="relative">
        <time dateTime={date.toISOString()}>
          {date.getDate()}
        </time>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-school-primary" />
        )}
      </div>
    );
  };
  
  // Handle month change in the calendar
  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month.getMonth());
    setSelectedYear(month.getFullYear());
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Academic Calendar</h1>
        <p className="text-lg text-muted-foreground">
          View important academic dates, holidays, exams, and school events
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Calendar View
            </CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              onMonthChange={handleMonthChange}
              className="rounded-md border"
              components={{
                Day: customDayRender
              }}
            />
            
            {date && getEventsForDate(date).length > 0 ? (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Events on {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                <div className="space-y-2">
                  {getEventsForDate(date).map((event, index) => (
                    <div key={index} className="rounded-md border p-3">
                      <Badge className={event.type.color}>{event.type.label}</Badge>
                      <p className="mt-2 font-medium">{event.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : date ? (
              <p className="mt-4 text-center text-muted-foreground">No events on this date</p>
            ) : null}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <CardTitle>
                Events for {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="holiday">Holidays</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                  <SelectItem value="activity">Activities</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getEventsForMonth().length > 0 ? (
                getEventsForMonth().map((event, index) => (
                  <div key={index} className="flex items-start rounded-md border p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-school-light text-school-primary">
                      {event.date.getDate()}
                    </div>
                    <div className="ml-4">
                      <Badge className={event.type.color}>{event.type.label}</Badge>
                      <h3 className="mt-1 font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No events found for this month with the selected filter.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Academic Year 2025-2026 Important Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-school-primary" />
                <h3 className="font-semibold">Academic Terms</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>First Term Begins</span>
                  <span className="font-medium">April 1, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>First Term Ends</span>
                  <span className="font-medium">September 30, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Second Term Begins</span>
                  <span className="font-medium">October 16, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Second Term Ends</span>
                  <span className="font-medium">March 31, 2026</span>
                </li>
              </ul>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center">
                <Award className="mr-2 h-5 w-5 text-school-primary" />
                <h3 className="font-semibold">Examination Schedule</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>First Unit Test</span>
                  <span className="font-medium">May 10-15, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Mid-Term Examination</span>
                  <span className="font-medium">July 10-20, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Second Unit Test</span>
                  <span className="font-medium">November 10-15, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Final Examination</span>
                  <span className="font-medium">February 20-March 5, 2026</span>
                </li>
              </ul>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center">
                <User className="mr-2 h-5 w-5 text-school-primary" />
                <h3 className="font-semibold">Parent-Teacher Meetings</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>First Meeting</span>
                  <span className="font-medium">April 20, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Second Meeting</span>
                  <span className="font-medium">July 25, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Third Meeting</span>
                  <span className="font-medium">November 20, 2025</span>
                </li>
                <li className="flex justify-between">
                  <span>Final Meeting</span>
                  <span className="font-medium">March 15, 2026</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicCalendar;
