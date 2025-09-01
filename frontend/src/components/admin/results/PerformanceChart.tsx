
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { StudentResults as StudentResultsType } from '@/integrations/supabase/client';
import { ExamTerm } from './ResultsTable';

interface ClassSummary {
  count: number;
  totalPercentage: number;
}

interface PerformanceChartProps {
  results: StudentResultsType[];
  selectedTerm: ExamTerm;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ results, selectedTerm }) => {
  // Group results by class for the selected term
  const resultsByClass = results.reduce((acc: Record<string, StudentResultsType[]>, result) => {
    if (selectedTerm === 'Midterm' || result.term === selectedTerm) {
      if (!acc[result.class_name]) {
        acc[result.class_name] = [];
      }
      acc[result.class_name].push(result);
    }
    return acc;
  }, {});

  // Data for the chart - class performance summary
  const classSummary = Object.entries(resultsByClass).reduce((acc: Record<string, ClassSummary>, [className, classResults]) => {
    const totalPercentage = classResults.reduce((sum, result) => sum + (result.marks / result.total_marks) * 100, 0);
    acc[className] = {
      count: classResults.length,
      totalPercentage: totalPercentage
    };
    return acc;
  }, {});

  const chartData = Object.entries(classSummary).map(([className, data]) => ({
    name: className,
    average: Math.round(data.totalPercentage / data.count)
  }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Class Performance Overview</CardTitle>
        <CardDescription>
          Average scores by class for {selectedTerm === 'Midterm' ? 'All Terms' : selectedTerm}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={{}} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="average" fill="#4f46e5">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.average >= 70 ? '#22c55e' : entry.average >= 50 ? '#eab308' : '#ef4444'} 
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
