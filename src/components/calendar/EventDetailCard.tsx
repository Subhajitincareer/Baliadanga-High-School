
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from './EventTypes';

interface EventDetailCardProps {
  date: Date;
  events: CalendarEvent[];
}

const EventDetailCard: React.FC<EventDetailCardProps> = ({ date, events }) => {
  const getEventsForDate = (date: Date, allEvents: CalendarEvent[]) => {
    return allEvents.filter(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const dateEvents = getEventsForDate(date, events);

  if (dateEvents.length === 0) {
    return <p className="mt-4 text-center text-muted-foreground">No events on this date</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      <h3 className="font-medium">Events on {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
      <div className="space-y-2">
        {dateEvents.map((event, index) => (
          <div key={index} className="rounded-md border p-3">
            <Badge className={event.type.color}>{event.type.label}</Badge>
            <p className="mt-2 font-medium">{event.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDetailCard;
