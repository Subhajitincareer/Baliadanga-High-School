import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Award, User } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/services/api';

interface AcademicYearDatesProps {
  events: any[]; // Using any[] to match the mapped events from parent, or ideally define a shared frontend interface
}

const AcademicYearDates: React.FC<AcademicYearDatesProps> = ({ events }) => {

  // Helper to format date range or single date
  const formatDate = (start: Date | string, end?: Date | string) => {
    if (!start) return 'TBA';
    const s = new Date(start);
    const e = end ? new Date(end) : null;

    if (e) {
      return `${format(s, 'MMMM d, yyyy')} - ${format(e, 'MMMM d, yyyy')}`;
    }
    return format(s, 'MMMM d, yyyy');
  };

  const terms = events.filter(e => e.type.name === 'TERM' || e.type === 'TERM' || e.type.name === 'Academic Term' || e.title.includes('Term'));
  const exams = events.filter(e => e.type.name === 'EXAM' || e.type === 'EXAM');
  const meetings = events.filter(e => e.type.name === 'MEETING' || e.type === 'MEETING');

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Academic Year Important Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-school-primary" />
              <h3 className="font-semibold">Academic Terms</h3>
            </div>
            {terms.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {terms.map((term: any, idx: number) => (
                  <li key={idx} className="flex flex-col border-b pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{term.title}</span>
                    <span className="text-muted-foreground">{formatDate(term.date, term.endDate || term.endTime)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No academic terms scheduled.</p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center">
              <Award className="mr-2 h-5 w-5 text-school-primary" />
              <h3 className="font-semibold">Examination Schedule</h3>
            </div>
            {exams.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {exams.map((exam: any, idx: number) => (
                  <li key={idx} className="flex flex-col border-b pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{exam.title}</span>
                    <span className="text-muted-foreground">{formatDate(exam.date, exam.endDate)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No exams scheduled.</p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center">
              <User className="mr-2 h-5 w-5 text-school-primary" />
              <h3 className="font-semibold">Parent-Teacher Meetings</h3>
            </div>
            {meetings.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {meetings.map((meeting: any, idx: number) => (
                  <li key={idx} className="flex flex-col border-b pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{meeting.title}</span>
                    <span className="text-muted-foreground">{formatDate(meeting.date)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No meetings scheduled.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicYearDates;
