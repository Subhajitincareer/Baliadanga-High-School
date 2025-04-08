
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from './EventTypes';

interface MonthlyEventsListProps {
  events: CalendarEvent[];
  selectedMonth: number;
  selectedYear: number;
  filter: string;
  setFilter: (value: string) => void;
}

const MonthlyEventsList: React.FC<MonthlyEventsListProps> = ({
  events,
  selectedMonth,
  selectedYear,
  filter,
  setFilter
}) => {
  // Get all events for the selected month with optional filtering
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

  const monthlyEvents = getEventsForMonth();

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Events for {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
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
      
      <div className="space-y-4">
        {monthlyEvents.length > 0 ? (
          monthlyEvents.map((event, index) => (
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
    </>
  );
};

export default MonthlyEventsList;
