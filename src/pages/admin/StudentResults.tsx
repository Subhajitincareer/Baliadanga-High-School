import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Download, Search, Plus, GraduationCap } from 'lucide-react';
import { supabase, StudentResults as StudentResultsType } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface StudentResult extends StudentResultsType {}

interface ClassSummary {
  count: number;
  totalPercentage: number;
}

const StudentResults = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResult, setNewResult] = useState({
    student_name: '',
    roll_number: '',
    class_name: '',
    subject: '',
    marks: '',
    total_marks: '100',
    term: 'Midterm',
    exam_date: new Date().toISOString().split('T')[0]
  });
  
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    
    fetchResults();
  }, [isAdmin, navigate]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch student results',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewResult(prev => ({ ...prev, [name]: value }));
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newResult.student_name || !newResult.roll_number || !newResult.class_name || 
        !newResult.subject || !newResult.marks || !newResult.total_marks) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('student_results')
        .insert({
          student_name: newResult.student_name,
          roll_number: newResult.roll_number,
          class_name: newResult.class_name,
          subject: newResult.subject,
          marks: parseInt(newResult.marks),
          total_marks: parseInt(newResult.total_marks),
          term: newResult.term,
          exam_date: newResult.exam_date
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Result added successfully'
      });

      // Reset form and refresh results
      setNewResult({
        student_name: '',
        roll_number: '',
        class_name: '',
        subject: '',
        marks: '',
        total_marks: '100',
        term: 'Midterm',
        exam_date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      fetchResults();
    } catch (error) {
      console.error('Error adding result:', error);
      toast({
        title: 'Error',
        description: 'Failed to add result',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const downloadCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Class', 'Subject', 'Marks', 'Total Marks', 'Term', 'Exam Date'];
    const dataRows = results.map(result => [
      result.student_name,
      result.roll_number,
      result.class_name,
      result.subject,
      result.marks,
      result.total_marks,
      result.term,
      new Date(result.exam_date).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student_results_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter results based on search term
  const filteredResults = results.filter(
    result =>
      result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Data for the chart
  const classSummary = results.reduce((acc: Record<string, ClassSummary>, result) => {
    const percentage = (result.marks / result.total_marks) * 100;
    if (!acc[result.class_name]) {
      acc[result.class_name] = { count: 0, totalPercentage: 0 };
    }
    acc[result.class_name].count++;
    acc[result.class_name].totalPercentage += percentage;
    return acc;
  }, {});

  const chartData = Object.entries(classSummary).map(([className, data]) => ({
    name: className,
    average: Math.round(data.totalPercentage / data.count)
  }));

  return (
    <div className="container py-8">
      <DashboardHeader 
        title="Student Results Management" 
        subtitle="View and manage student examination results" 
        onLogout={handleLogout}
      />

      <div className="my-6">
        <Button 
          variant="outline"
          onClick={handleBackToDashboard}
          className="mb-4"
        >
          Back to Dashboard
        </Button>
      </div>

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
            <CardDescription>Average percentage across all results</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {results.length > 0 
                ? Math.round(
                    results.reduce((sum, result) => 
                      sum + (result.marks / result.total_marks) * 100, 0
                    ) / results.length
                  ) 
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart for class performance */}
      {chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
            <CardDescription>Average scores by class</CardDescription>
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
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Result
          </Button>
          <Button 
            variant="secondary" 
            onClick={downloadCSV}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Result</CardTitle>
            <CardDescription>Enter the student's result information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddResult} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="student_name" className="text-sm font-medium">Student Name</label>
                <Input
                  id="student_name"
                  name="student_name"
                  value={newResult.student_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="roll_number" className="text-sm font-medium">Roll Number</label>
                <Input
                  id="roll_number"
                  name="roll_number"
                  value={newResult.roll_number}
                  onChange={handleInputChange}
                  placeholder="R-12345"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="class_name" className="text-sm font-medium">Class</label>
                <Input
                  id="class_name"
                  name="class_name"
                  value={newResult.class_name}
                  onChange={handleInputChange}
                  placeholder="Grade 10"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="subject"
                  name="subject"
                  value={newResult.subject}
                  onChange={handleInputChange}
                  placeholder="Mathematics"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="marks" className="text-sm font-medium">Marks Obtained</label>
                <Input
                  id="marks"
                  name="marks"
                  type="number"
                  min="0"
                  max={newResult.total_marks}
                  value={newResult.marks}
                  onChange={handleInputChange}
                  placeholder="85"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="total_marks" className="text-sm font-medium">Total Marks</label>
                <Input
                  id="total_marks"
                  name="total_marks"
                  type="number"
                  min="1"
                  value={newResult.total_marks}
                  onChange={handleInputChange}
                  placeholder="100"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="term" className="text-sm font-medium">Term</label>
                <Input
                  id="term"
                  name="term"
                  value={newResult.term}
                  onChange={handleInputChange}
                  placeholder="Midterm"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="exam_date" className="text-sm font-medium">Exam Date</label>
                <Input
                  id="exam_date"
                  name="exam_date"
                  type="date"
                  value={newResult.exam_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit">Save Result</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Student Results
          </CardTitle>
          <CardDescription>
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading results...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found</p>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentResults;
