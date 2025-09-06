import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BookOpen, Calendar, Award } from 'lucide-react';
// Replace this import with your actual backend results type!
import { StudentResultsType } from '@/schemas/studentResult';

interface StudentResultCardProps {
  result: StudentResultsType;
}

const StudentResultCard: React.FC<StudentResultCardProps> = ({ result }) => {
  const percentage = Math.round((result.marks / result.total_marks) * 100);

  const getGradeColor = () => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeLetter = () => {
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const getStatusText = () => {
    if (percentage >= 40) return 'PASS';
    return 'FAIL';
  };

  return (
    <Card className={`overflow-hidden border ${getGradeColor()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{result.class_name}</p>
            <h3 className="text-lg font-bold flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              {result.subject}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">{result.term}</span>
            <div className="flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="text-xs">
                {new Date(result.exam_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded p-2 shadow-sm">
            <p className="text-xs text-muted-foreground">Marks</p>
            <p className="text-lg font-bold">{result.marks}/{result.total_marks}</p>
          </div>
          <div className="bg-white rounded p-2 shadow-sm">
            <p className="text-xs text-muted-foreground">Percentage</p>
            <p className="text-lg font-bold">{percentage}%</p>
          </div>
          <div className="bg-white rounded p-2 shadow-sm">
            <p className="text-xs text-muted-foreground">Grade</p>
            <p className="text-lg font-bold">{getGradeLetter()}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-white/50">
        <div className="flex items-center">
          <Award className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        {percentage >= 80 && (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            Distinction
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default StudentResultCard;
