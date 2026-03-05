import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Award, BookOpen, Loader2 } from 'lucide-react';
import apiService from '@/services/api'; 
import { useToast } from '@/hooks/use-toast';
import { StudentResultsType } from '@/schemas/studentResult'; 
import ResultsTable, { ExamTerm } from '@/components/admin/results/ResultsTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentResultCard from '@/components/results/StudentResultCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ResultDisplay = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [section, setSection] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState<StudentResultsType[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<ExamTerm>('Midterm');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      const data = await apiService.getExams();
      setExams(data || []);
    };
    fetchExams();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const params = {
        rollNumber: rollNumber || undefined,
        name: studentName || undefined,
        class: selectedClass || undefined,
        section: section || undefined,
        examId: selectedExamId || undefined
      };

      const data = await apiService.getPublicResult(params);

      // Backend returns { student, results } if one student, or { students: [] } if multiple
      let resultsToSet: any[] = [];
      
      if (data.students) {
        // Multi-student result (maybe searching by class/section)
        // For the single-student UI, we take the results of the first match or flatten
        // But usually public search is for ONE student.
        // Let's flatten for now or take the first student's results
        resultsToSet = data.students[0]?.results || [];
      } else if (data.results) {
        resultsToSet = data.results;
      }

      if (resultsToSet.length > 0) {
        // Map to StudentResultsType expected by components
        const mappedResults = resultsToSet.map(r => ({
          ...r,
          id: r._id,
          student_name: data.student?.name || data.students?.[0]?.student?.name || 'Student',
          roll_number: data.student?.rollNumber || data.students?.[0]?.student?.rollNumber || '',
          exam_name: r.examId?.name || 'Examination',
          marks: r.totalObtained,
          total_marks: r.examId?.subjects?.reduce((s: number, sub: any) => s + (sub.fullMarks || 100), 0) || 100,
          subjects: Object.entries(r.marks || {}).map(([name, obtained]) => ({
            name,
            obtained: obtained as number,
            total: r.examId?.subjects?.find((s: any) => s.name === name)?.fullMarks || 100
          }))
        }));

        setResults(mappedResults);
        toast({
          title: 'Results found',
          description: `Found ${mappedResults.length} exams recorded for the student`,
        });
      } else {
        setResults([]);
        toast({
          title: 'No results found',
          description: 'Please check your details and try again. Results might not be published yet.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch results. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAveragePerformance = () => {
    if (!results.length) return 0;
    const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
    return Math.round(totalPercentage / results.length);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="container py-8 min-h-screen">
      <div className="flex flex-col items-center justify-center mb-8 text-center text-school-primary">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-8 w-8 text-school-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight">Student Result Portal</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Official portal to check examination results of Baliadanga High School
        </p>
      </div>

      <Card className="mx-auto max-w-4xl mb-8 border-t-4 border-t-school-primary shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Search className="mr-2 h-6 w-6" />
            Find Your Result
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            Provide your academic details below to fetch your marksheet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Academic Class</label>
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {['5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                      <SelectItem key={c} value={c}>Class {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Section</label>
                <Select onValueChange={setSection} value={section}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A', 'B', 'C', 'D'].map(s => (
                      <SelectItem key={s} value={s}>Section {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Specific Exam (Optional)</label>
                <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All Published Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Published Exams</SelectItem>
                    {exams.filter(e => e.isPublished).map(e => (
                      <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="roll_number" className="text-sm font-semibold">Roll Number</label>
                <Input
                  id="roll_number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter your roll number"
                  className="h-11 text-lg font-mono"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="student_name" className="text-sm font-semibold">Student Name (Partial Search)</label>
                <Input
                  id="student_name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-11 text-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" className="h-11 px-6 font-semibold" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button type="submit" className="h-11 px-8 font-bold bg-school-primary hover:bg-school-primary/90" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Show My Results
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searched && !loading && (
        <>
          {results.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-200 shadow-md transform hover:scale-105 transition-transform">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-indigo-600 font-semibold uppercase tracking-wider text-xs">Student Profile</CardDescription>
                    <CardTitle className="text-2xl text-indigo-900 truncate">{results[0].student_name}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200 shadow-md transform hover:scale-105 transition-transform">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-purple-600 font-semibold uppercase tracking-wider text-xs">Roll Number</CardDescription>
                    <CardTitle className="text-2xl text-purple-900 font-mono">{results[0].roll_number}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-md transform hover:scale-105 transition-transform">
                  <CardHeader className="pb-2 text-center">
                    <CardDescription className="text-emerald-600 font-semibold uppercase tracking-wider text-xs">Average Performance</CardDescription>
                    <CardTitle className={`text-4xl font-black ${getPerformanceColor(calculateAveragePerformance())}`}>
                      {calculateAveragePerformance()}%
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Tabs defaultValue="card" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="grid w-[400px] grid-cols-2 p-1 bg-muted/20">
                    <TabsTrigger value="card" className="font-semibold px-8 data-[state=active]:bg-school-primary data-[state=active]:text-white">Card View</TabsTrigger>
                    <TabsTrigger value="table" className="font-semibold px-8 data-[state=active]:bg-school-primary data-[state=active]:text-white">Detailed Table</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="card" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {results.map(result => (
                      <StudentResultCard key={result.id} result={result} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="table" className="mt-6 border rounded-xl overflow-hidden bg-white shadow-xl">
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
            <div className="text-center py-20 bg-muted/5 rounded-3xl border-2 border-dashed border-muted">
              <Award className="mx-auto h-20 w-20 text-muted-foreground opacity-10" />
              <h3 className="mt-6 text-2xl font-bold text-muted-foreground">No Official Results Found</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-lg leading-relaxed">
                We couldn't find any results matches the provided criteria. Ensure the information is correct and the exam results have been published by the administration.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultDisplay;
