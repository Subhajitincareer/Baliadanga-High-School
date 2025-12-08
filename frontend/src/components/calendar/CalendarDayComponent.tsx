import React, { useMemo } from 'react';
import { CalendarEvent } from './EventTypes';
import { cn } from '@/lib/utils';
import { DayProps } from 'react-day-picker';

interface CalendarDayProps {
  props: DayProps;
  events: CalendarEvent[];
}

const CalendarDayComponent: React.FC<CalendarDayProps> = ({ props, events }) => {
  // @ts-ignore - DayProps type definition seems to differ from runtime or expected v9 interface
  const { day, modifiers, className, style, ...restProps } = props;

  // Extract date from 'day' object if available, otherwise it might be directly on props (but lint says no)
  // In v9, it seems 'day' holds the date info.
  const date = day?.date || (props as any).date;

  if (!date) {
    console.warn("CalendarDayComponent: date is undefined", props);
    return <div />;
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

  // If outside current month and hidden, return empty
  if (props.hidden) {
    return <div />;
  }

  // Accessibility: aria-label with event count
  const eventLabel = dayEvents.length > 0 ? `${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}` : '';
  const ariaLabel = props['aria-label'] ? `${props['aria-label']} ${eventLabel}` : `Day ${date.getDate()} ${eventLabel}`;

  return (
    <td className="p-0 relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md">
      <button
        {...restProps as any}
        className={cn(
          // shadcn calendar styles usually applied via props.className
          className,
          "relative flex items-center justify-center h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        )}
        style={style}
        type="button"
        aria-label={ariaLabel}
      >
        <time dateTime={date.toISOString()}>{date.getDate()}</time>

        {dayEvents.length > 0 && (
          <span
            className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-school-primary"
            aria-hidden="true"
          />
        )}
      </button>
    </td>
  );
};

export default CalendarDayComponent;
