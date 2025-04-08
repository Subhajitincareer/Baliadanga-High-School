
import { CalendarEvent } from './EventTypes';

interface CalendarDayProps {
  props: any;
  events: CalendarEvent[];
}

const CalendarDayComponent = ({ props, events }: CalendarDayProps) => {
  // Ensure we have a valid date before proceeding
  if (!props || !props.date) {
    return (
      <div className="relative">
        <time>{props?.day?.getDate?.() || ''}</time>
      </div>
    );
  }
  
  // Use the date prop which is available in the DayPicker component props
  const date = props.date;
  const dayEvents = events.filter(
    event =>
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

export default CalendarDayComponent;
