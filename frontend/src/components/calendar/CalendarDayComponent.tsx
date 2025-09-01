import React, { useMemo } from 'react';
import { CalendarEvent } from './EventTypes';

interface CalendarDayProps {
  props: {
    date?: Date;
    day?: {
      getDate?: () => number;
    };
  };
  events: CalendarEvent[];
}

const CalendarDayComponent: React.FC<CalendarDayProps> = ({ props, events }) => {
  const { date, day } = props || {};

  // Fallback: Show day number if `date` is not available
  if (!date) {
    return (
      <div className="relative" aria-label={`Day ${day?.getDate?.() ?? ''}`}>
        <time dateTime="" aria-hidden="true">
          {day?.getDate?.() ?? ''}
        </time>
      </div>
    );
  }

  // Memoize filtering events for this date to optimize performance
  const dayEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  }, [events, date]);

  // Accessibility: aria-label with event count (or zero)
  const ariaLabel = `Day ${date.getDate()} with ${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}`;

  return (
    <div className="relative" aria-label={ariaLabel}>
      <time dateTime={date.toISOString()}>{date.getDate()}</time>

      {dayEvents.length > 0 && (
        <div
          className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-school-primary"
          aria-hidden="true"
          title={`${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}`}
        />
      )}
    </div>
  );
};

export default CalendarDayComponent;
