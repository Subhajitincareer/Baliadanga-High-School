
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from './EventTypes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface MonthlyEventsListProps {
  events: CalendarEvent[];
  selectedMonth: number;
  selectedYear: number;
  filter: string;
  setFilter: (value: string) => void;
}

// Helper function to get week number of a date
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Get the start date of a week given a date in that week
const getWeekStartDate = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
};

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

  // Group events by week
  const groupEventsByWeek = () => {
    const eventsByWeek: Record<string, CalendarEvent[]> = {};
    
    monthlyEvents.forEach(event => {
      const weekNumber = getWeekNumber(event.date);
      const weekStart = getWeekStartDate(event.date);
      const weekKey = `${weekNumber}-${weekStart.toISOString().split('T')[0]}`;
      
      if (!eventsByWeek[weekKey]) {
        eventsByWeek[weekKey] = [];
      }
      
      eventsByWeek[weekKey].push(event);
    });
    
    // Sort weeks by their start date
    return Object.entries(eventsByWeek)
      .sort(([keyA], [keyB]) => {
        const dateA = new Date(keyA.split('-')[1]);
        const dateB = new Date(keyB.split('-')[1]);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const weeklyEvents = groupEventsByWeek();

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
        {weeklyEvents.length > 0 ? (
          weeklyEvents.map(([weekKey, events]) => {
            const weekStartDate = new Date(weekKey.split('-')[1]);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            
            return (
              <Collapsible key={weekKey} className="border rounded-md overflow-hidden">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted transition-colors">
                  <div className="font-medium">
                    Week of {weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 p-2">
                    {events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-start rounded-md border p-4">
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
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
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
