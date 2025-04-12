
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Award, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { StudentResults as StudentResultsType } from '@/integrations/supabase/client';
import ResultsTable, { ExamTerm } from '@/components/admin/results/ResultsTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentResultCard from '@/components/results/StudentResultCard';

const ResultDisplay = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [results, setResults] = useState<StudentResultsType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<ExamTerm>('Midterm');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    try {
      let query = supabase
        .from('student_results')
        .select('*')
        .order('subject', { ascending: true });
        
      if (rollNumber) {
        query = query.eq('roll_number', rollNumber);
      }
      
      if (studentName) {
        query = query.ilike('student_name', `%${studentName}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setResults(data);
        toast({
          title: "Results found",
          description: `Found ${data.length} results for the student`,
        });
      } else {
        setResults([]);
        toast({
          title: "No results found",
          description: "Please check the roll number or student name and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error",
        description: "Failed to fetch results. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAveragePerformance = () => {
    if (!results.length) return 0;
    
    const totalPercentage = results.reduce((sum, result) => 
      sum + (result.marks / result.total_marks) * 100, 0);
    
    return Math.round(totalPercentage / results.length);
  };
  
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600'; 
    return 'text-red-600';
  };

  return (
    <div className="container py-8 min-h-screen">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-6 w-6 text-school-primary" />
          <h1 className="text-3xl font-bold">Student Result Portal</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-md">
          Enter your roll number or name to view your examination results
        </p>
      </div>

      <Card className="mx-auto max-w-2xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Search Results
          </CardTitle>
          <CardDescription>
            Enter your roll number or name to find your results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="roll_number" className="text-sm font-medium">Roll Number</label>
              <Input
                id="roll_number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your roll number"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="student_name" className="text-sm font-medium">Student Name</label>
              <Input
                id="student_name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
              />
              <p className="text-xs text-muted-foreground">At least one field is required</p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button type="submit" disabled={!rollNumber && !studentName}>
                {loading ? 'Searching...' : 'Search Results'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <>
          {results.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardDescription>Student Name</CardDescription>
                    <CardTitle>{results[0].student_name}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardDescription>Roll Number</CardDescription>
                    <CardTitle>{results[0].roll_number}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="pb-2">
                    <CardDescription>Average Performance</CardDescription>
                    <CardTitle className={getPerformanceColor(calculateAveragePerformance())}>
                      {calculateAveragePerformance()}%
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">Card View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map(result => (
                      <StudentResultCard key={result.id} result={result} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="table" className="mt-6">
                  <ResultsTable 
                    results={results}
                    selectedTerm={selectedTerm}
                    setSelectedTerm={setSelectedTerm}
                    isLoading={loading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-xl font-medium">No results found</h3>
              <p className="text-muted-foreground">
                We couldn't find any results matching your search criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultDisplay;
