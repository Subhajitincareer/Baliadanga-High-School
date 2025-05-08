
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { GraduationCap, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StudentResults as StudentResultsType } from '@/integrations/supabase/client';

export const examTerms = ['1summit', '2summit', 'Final Exam', 'Midterm'] as const;
export type ExamTerm = typeof examTerms[number];

interface ResultsTableProps {
  results: StudentResultsType[];
  selectedTerm: ExamTerm;
  setSelectedTerm: (term: ExamTerm) => void;
  isLoading: boolean;
  onDeleteClick?: (result: StudentResultsType) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  selectedTerm,
  setSelectedTerm,
  isLoading,
  onDeleteClick
}) => {
  const filteredResults = results.filter(
    result => (selectedTerm === 'Midterm' || result.term === selectedTerm)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="mr-2 h-5 w-5" />
          Student Results
        </CardTitle>
        <CardDescription>
          {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
        </CardDescription>
        
        <Tabs defaultValue="Midterm" value={selectedTerm} onValueChange={(value) => setSelectedTerm(value as ExamTerm)} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            {examTerms.map(term => (
              <TabsTrigger key={term} value={term}>
                {term}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading results...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found for {selectedTerm} term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Marks</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.student_name}</TableCell>
                    <TableCell>{result.roll_number}</TableCell>
                    <TableCell>{result.class_name}</TableCell>
                    <TableCell>{result.subject}</TableCell>
                    <TableCell className="text-right">
                      <span 
                        className={
                          (result.marks / result.total_marks) >= 0.7 ? "text-green-600 font-semibold" :
                          (result.marks / result.total_marks) >= 0.5 ? "text-amber-600 font-semibold" :
                          "text-red-600 font-semibold"
                        }
                      >
                        {result.marks}/{result.total_marks}
                        {' '}
                        ({Math.round((result.marks / result.total_marks) * 100)}%)
                      </span>
                    </TableCell>
                    <TableCell>{result.term}</TableCell>
                    <TableCell>{new Date(result.exam_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {onDeleteClick && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteClick(result)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete result</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
