import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Updated interface to match MongoDB schema
interface StudentResult {
  _id?: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  examType: 'Unit Test' | 'Mid Term' | 'Final Exam' | 'Annual' | 'Monthly Test';
  academicYear: string;
  subjects: Array<{
    subjectName: string;
    subjectCode: string;
    fullMarks: number;
    obtainedMarks: number;
    grade?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    remarks?: string;
  }>;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  rank?: number;
  publishDate?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

// Updated ExamTerm type to match your schema
type ExamTerm = 'Unit Test' | 'Mid Term' | 'Final Exam' | 'Annual' | 'Monthly Test' | 'All';

interface ClassSummary {
  count: number;
  totalPercentage: number;
}

interface PerformanceChartProps {
  results: StudentResult[];
  selectedTerm: ExamTerm;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ results, selectedTerm }) => {
  // Group results by class for the selected term
  const resultsByClass = results.reduce((acc: Record<string, StudentResult[]>, result) => {
    if (selectedTerm === 'All' || result.examType === selectedTerm) {
      const classKey = `${result.class}-${result.section}`;
      if (!acc[classKey]) {
        acc[classKey] = [];
      }
      acc[classKey].push(result);
    }
    return acc;
  }, {});

  // Data for the chart - class performance summary
  const classSummary = Object.entries(resultsByClass).reduce((acc: Record<string, ClassSummary>, [className, classResults]) => {
    const totalPercentage = classResults.reduce((sum, result) => sum + result.percentage, 0);
    acc[className] = {
      count: classResults.length,
      totalPercentage: totalPercentage
    };
    return acc;
  }, {});

  const chartData = Object.entries(classSummary).map(([className, data]) => ({
    name: className,
    average: Math.round(data.totalPercentage / data.count),
    studentCount: data.count
  }));

  // Sort by class name for better visualization
  chartData.sort((a, b) => a.name.localeCompare(b.name));

  if (chartData.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Class Performance Overview</CardTitle>
          <CardDescription>
            No results available for {selectedTerm === 'All' ? 'All Exam Types' : selectedTerm}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip component for better information display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{`Class: ${label}`}</p>
          <p className="text-sm text-muted-foreground">{`Students: ${data.studentCount}`}</p>
          <p className="text-sm">{`Average: ${data.average}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Class Performance Overview</CardTitle>
        <CardDescription>
          Average scores by class for {selectedTerm === 'All' ? 'All Exam Types' : selectedTerm}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ChartContainer config={{}} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-sm"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 100]} 
                className="text-sm"
                label={{ value: 'Average (%)', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={
                      entry.average >= 85 ? '#22c55e' :  // Green for excellent (85%+)
                      entry.average >= 70 ? '#3b82f6' :  // Blue for good (70-84%)
                      entry.average >= 50 ? '#eab308' :  // Yellow for average (50-69%)
                      '#ef4444'                          // Red for below average (<50%)
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
