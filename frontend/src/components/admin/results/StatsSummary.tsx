import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
// Update this import to the actual backend schema!
import { StudentResultsType } from '@/schemas/studentResult';

interface StatsSummaryProps {
  results: StudentResultsType[];
  filteredResults: StudentResultsType[];
  classSummary: Record<string, { count: number; totalPercentage: number }>;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ results, filteredResults, classSummary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Total Results</CardTitle>
          <CardDescription>Number of results recorded</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{results.length}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>Number of classes with results</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{Object.keys(classSummary).length}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Average Score</CardTitle>
          <CardDescription>Average percentage across selected results</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {filteredResults.length > 0 
              ? Math.round(
                  filteredResults.reduce((sum, result) => 
                    sum + (result.marks / result.total_marks) * 100, 0
                  ) / filteredResults.length
                ) 
              : 0}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummary;
