import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ReportCardPrint } from '@/components/admin/ReportCardPrint';
import { Loader2, TrophyIcon, Search, Send, BookOpen, Printer } from 'lucide-react';

interface Exam {
  _id: string;
  name: string;
  type: string;
  class: string;
  section?: string;
  academicYear?: string;
  isPublished: boolean;
  subjects: { name: string; fullMarks: number }[];
}

interface StudentResult {
  _id: string;
  studentId: { _id: string; name: string; email: string; rollNumber?: string } | string;
  examId: string;
  marks: Record<string, number>;
  totalObtained: number;
  percentage: number;
  grade: string;
  rank?: number;
}

const GradeBadge = ({ grade }: { grade: string }) => {
  const color =
    grade === 'A+' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    grade === 'A'  ? 'bg-green-100 text-green-700 border-green-200' :
    grade === 'B+' ? 'bg-blue-100 text-blue-700 border-blue-200' :
    grade === 'B'  ? 'bg-sky-100 text-sky-700 border-sky-200' :
    grade === 'C'  ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    grade === 'D'  ? 'bg-orange-100 text-orange-700 border-orange-200' :
                     'bg-red-100 text-red-700 border-red-200';
  return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>{grade}</span>;
};

const StudentResults: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintData, setSelectedPrintData] = useState<any>(null);

  const selectedExam = exams.find(e => e._id === selectedExamId);

  // Load all exams on mount
  useEffect(() => {
    setIsLoadingExams(true);
    apiService.getExams()
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(() => toast({ title: 'Failed to load exams', variant: 'destructive' }))
      .finally(() => setIsLoadingExams(false));
  }, []);

  // Load results when exam changes
  useEffect(() => {
    if (!selectedExamId) { setResults([]); return; }
    setIsLoadingResults(true);
    apiService.getExamResults(selectedExamId)
      .then(data => {
        const arr = Array.isArray(data) ? data : ((data as any)?.data ?? []);
        setResults(arr);
      })
      .catch(() => {})
      .finally(() => setIsLoadingResults(false));
  }, [selectedExamId]);

  const handlePublish = async () => {
    if (!selectedExamId) return;
    setIsPublishing(true);
    try {
      await apiService.publishResult(selectedExamId);
      toast({ title: 'Results Published!', description: 'Ranks have been calculated and students can now view their results.' });
      setExams(prev => prev.map(e => e._id === selectedExamId ? { ...e, isPublished: true } : e));
    } catch {
      toast({ title: 'Failed to publish', variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  const filtered = results.filter(r => {
    const s = typeof r.studentId === 'object' ? r.studentId as any : null;
    const name = (s?.user?.name || s?.name || '').toLowerCase();
    return !searchTerm || name.includes(searchTerm.toLowerCase());
  });

  const handlePrintClick = (result: StudentResult) => {
    if (!selectedExam) return;
    const s = typeof result.studentId === 'object' ? (result.studentId as any) : null;
    
    // Format data for ReportCardPrint
    const printData = {
      student: {
        name: s?.user?.name || s?.name || 'Unknown',
        studentId: s?.studentId || 'N/A',
        rollNumber: s?.rollNumber || 'N/A',
        class: selectedExam.class,
        section: selectedExam.section || 'A',
        session: selectedExam.academicYear
      },
      exam: {
        name: selectedExam.name,
        type: selectedExam.type,
        academicYear: selectedExam.academicYear || '',
        subjects: selectedExam.subjects
      },
      result: {
        marks: result.marks,
        totalObtained: result.totalObtained,
        percentage: result.percentage,
        grade: result.grade,
        rank: result.rank
      }
    };
    
    setSelectedPrintData(printData);
    setIsPrintModalOpen(true);
  };

  // Stats
  const avgPct = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
  const passCount = results.filter(r => r.percentage >= 33).length;

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Results</h2>
          <p className="text-muted-foreground">Manage examination results and reports</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total Results</CardDescription><CardTitle className="text-3xl">{results.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Pass Rate</CardDescription><CardTitle className="text-3xl">{results.length > 0 ? Math.round((passCount / results.length) * 100) : 0}%</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Average Score</CardDescription><CardTitle className="text-3xl">{avgPct}%</CardTitle></CardHeader></Card>
      </div>

      {/* Exam Selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[240px]">
              <Select value={selectedExamId} onValueChange={setSelectedExamId} disabled={isLoadingExams}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingExams ? 'Loading exams…' : 'Select an Exam to view results'} />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name} — Class {exam.class} {exam.section || ''} {exam.isPublished ? '✅' : '(Draft)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedExamId && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search student…" className="pl-9 w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                {!selectedExam?.isPublished && (
                  <Button onClick={handlePublish} disabled={isPublishing || results.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
                    {isPublishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Publish & Rank Students
                  </Button>
                )}
                {selectedExam?.isPublished && (
                  <Badge className="bg-green-100 text-green-700 border border-green-200">✅ Published</Badge>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {!selectedExamId ? (
        <div className="border-2 border-dashed rounded-lg py-16 text-center text-muted-foreground">
          <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">Select an exam above to view results</p>
          <p className="text-sm mt-1">You can also publish results and generate ranks from here</p>
        </div>
      ) : isLoadingResults ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg py-12 text-center text-muted-foreground">
          <p className="font-medium">No results found for this exam yet.</p>
          <p className="text-sm mt-1">Go to <strong>Marks Entry</strong> to start entering marks.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-amber-500" /> Results — {selectedExam?.name}
            </CardTitle>
            <CardDescription>Class {selectedExam?.class} {selectedExam?.section} • {filtered.length} student(s)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  {selectedExam?.subjects?.map(s => (
                    <TableHead key={s.name} className="text-center">{s.name}<span className="text-xs text-muted-foreground ml-1">/{s.fullMarks}</span></TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((result, idx) => {
                    const s = typeof result.studentId === 'object' ? (result.studentId as any) : null;
                    const studentName = s?.user?.name || s?.name || 'Unknown';
                    const studentEmail = s?.user?.email || s?.email || '';
                    const rollNo = s?.rollNumber || '';
                    return (
                      <TableRow key={result._id}>
                        <TableCell className="font-mono font-bold text-amber-600">
                          {result.rank || (idx + 1)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{studentName}</div>
                          <div className="text-xs text-muted-foreground">{rollNo} {studentEmail && `• ${studentEmail}`}</div>
                        </TableCell>
                        {selectedExam?.subjects?.map(s => (
                          <TableCell key={s.name} className="text-center font-mono">
                            {result.marks?.[s.name] ?? '—'}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-mono font-semibold">{result.totalObtained}</TableCell>
                        <TableCell className="text-center font-semibold">{Math.round(result.percentage)}%</TableCell>
                        <TableCell className="text-center"><GradeBadge grade={result.grade} /></TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handlePrintClick(result)}
                            title="Print Report Card"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Report Card Modal */}
      <ReportCardPrint 
        data={selectedPrintData} 
        open={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
      />
    </div>
  );
};

export default StudentResults;
