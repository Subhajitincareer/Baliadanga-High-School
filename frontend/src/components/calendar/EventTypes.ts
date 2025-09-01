
// Define calendar event types and their corresponding colors
export const EVENT_TYPES = {
  HOLIDAY: { label: "Holiday", color: "bg-red-100 text-red-800 border-red-200" },
  EXAM: { label: "Exam", color: "bg-amber-100 text-amber-800 border-amber-200" },
  ACTIVITY: { label: "Activity", color: "bg-blue-100 text-blue-800 border-blue-200" },
  MEETING: { label: "Meeting", color: "bg-purple-100 text-purple-800 border-purple-200" }
};

export interface CalendarEvent {
  date: Date;
  title: string;
  type: {
    label: string;
    color: string;
  };
}

// Sample calendar events for the current year
export const generateEvents = (): CalendarEvent[] => {
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
