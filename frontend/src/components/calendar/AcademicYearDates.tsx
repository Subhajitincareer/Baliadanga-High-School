
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Award, User } from 'lucide-react';

const AcademicYearDates: React.FC = () => {
  return (
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
  );
};

export default AcademicYearDates;
