import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2 } from 'lucide-react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '@/utils/constants';

interface Student {
    _id: string;
    name: string;
    studentId: string;
    rollNumber: string;
}

interface Exam {
    _id: string;
    name: string;
    class?: string;
    subjects: { name: string; fullMarks: number }[];
}

const MarksEntry = () => {
    const { toast } = useToast();
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    // Filters
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Marks Data: map[studentProfileId] -> mark
    const [marksData, setMarksData] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingStudents, setIsFetchingStudents] = useState(false);

    useEffect(() => {
        apiService.getExams().then(setExams).catch(console.error);
    }, []);

    // Fetch students when class+section change
    useEffect(() => {
        if (selectedClass && selectedSection) {
            setIsFetchingStudents(true);
            apiService.getStudentsByClass(selectedClass, selectedSection)
                .then(data => setStudents(data))
                .catch(() => toast({ title: 'Failed to load students', variant: 'destructive' }))
                .finally(() => setIsFetchingStudents(false));
        }
    }, [selectedClass, selectedSection]);

    const handleMarkChange = (studentProfileId: string, value: string) => {
        const numValue = parseFloat(value);
        setMarksData(prev => ({ ...prev, [studentProfileId]: isNaN(numValue) ? 0 : numValue }));
    };

    // Single bulk POST — replaces N parallel requests
    const handleSave = async () => {
        if (!selectedExamId || !selectedSubject) {
            toast({ title: 'Error', description: 'Please select Exam and Subject', variant: 'destructive' });
            return;
        }
        if (students.length === 0) {
            toast({ title: 'No students', description: 'Select a class and section first.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            const entries = students.map(s => ({
                studentProfileId: s._id,
                mark: marksData[s._id] ?? 0
            }));

            const result = await apiService.bulkUpsertMarks({
                examId: selectedExamId,
                subject: selectedSubject,
                entries
            });

            toast({
                title: 'Marks Saved',
                description: result.message || `${entries.length} student marks saved.`,
            });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to save marks', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedExam = exams.find(e => e._id === selectedExamId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Marks Entry</h2>

            <Card className="p-4 bg-slate-50 border-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Exam</Label>
                        <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                            <SelectTrigger><SelectValue placeholder="Choose Exam" /></SelectTrigger>
                            <SelectContent>
                                {exams.map(exam => (
                                    <SelectItem key={exam._id} value={exam._id}>{exam.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedExamId}>
                            <SelectTrigger><SelectValue placeholder="Choose Subject" /></SelectTrigger>
                            <SelectContent>
                                {selectedExam?.subjects.map(sub => (
                                    <SelectItem key={sub.name} value={sub.name}>
                                        {sub.name} <span className="text-muted-foreground text-xs">(Max: {sub.fullMarks})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Select onValueChange={setSelectedClass} value={selectedClass}>
                            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                            <SelectContent>
                                {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Section</Label>
                        <Select onValueChange={setSelectedSection} value={selectedSection}>
                            <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                            <SelectContent>
                                {SECTION_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={isLoading || !selectedSubject || students.length === 0}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Marks
                    </Button>
                </div>
            </Card>

            {isFetchingStudents ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
            ) : selectedExamId && selectedSubject && students.length > 0 ? (
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Roll</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Student ID</TableHead>
                                <TableHead className="w-[140px]">
                                    Marks
                                    {selectedExam?.subjects.find(s => s.name === selectedSubject) && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            / {selectedExam.subjects.find(s => s.name === selectedSubject)!.fullMarks}
                                        </Badge>
                                    )}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => (
                                <TableRow key={student._id}>
                                    <TableCell className="font-mono">{student.rollNumber}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{student.studentId}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min={0}
                                            className="w-24"
                                            placeholder="0"
                                            value={marksData[student._id] ?? ''}
                                            onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    {selectedClass && selectedSection
                        ? 'Select Exam and Subject to start entering marks.'
                        : 'Select Class, Section, Exam and Subject to load students.'}
                </div>
            )}
        </div>
    );
};

export default MarksEntry;
