import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StudentResult } from '@/services/api';

interface ExamResultCardProps {
    result: StudentResult;
}

export const ExamResultCard: React.FC<ExamResultCardProps> = ({ result }) => {
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A+': return 'bg-green-100 text-green-800 border-green-200';
            case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'B+': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'B': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'C+': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 bg-muted/30">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-background">{result.academicYear}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(result.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {result.examType}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            <BookOpen className="h-3 w-3" />
                            {result.subjects.length} Subjects Evaluated
                        </CardDescription>
                    </div>
                    <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${getGradeColor(result.overallGrade)}`}>
                        <span className="text-xs font-bold uppercase">Grade</span>
                        <span className="text-xl font-black">{result.overallGrade}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-sm text-muted-foreground">Overall Percentage</p>
                        <p className="text-2xl font-bold text-school-primary">{result.percentage}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="font-medium">{result.obtainedMarks} / {result.totalMarks}</p>
                    </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div
                        className="bg-school-primary h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(result.percentage, 100)}%` }}
                    ></div>
                </div>
            </CardContent>
        </Card>
    );
};
