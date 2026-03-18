import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Download, Upload } from 'lucide-react';
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
        apiService.getExams().then(setExams).catch(() => {});
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

    // --- Banglar Shiksha Style Template Export/Import ---

    const handleDownloadTemplate = () => {
        if (!selectedExamId || !selectedSubject || students.length === 0) {
            toast({ title: 'Error', description: 'Select Exam, Subject, Class and Section to download template', variant: 'destructive' });
            return;
        }

        const headers = ['Student Profile ID', 'Roll Number', 'Student Name', 'Student ID', 'Marks'];
        const csvRows = students.map(s => {
            const currentMark = marksData[s._id] !== undefined ? marksData[s._id] : '';
            return `"${s._id}","${s.rollNumber}","${s.name}","${s.studentId}","${currentMark}"`;
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `MarksTemplate_${selectedClass}_${selectedSection}_${selectedSubject}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target?.result as string;
            if (!csvText) return;

            const lines = csvText.split('\n');
            const newMarks: Record<string, number> = {};
            let matchCount = 0;

            // Skip header (i=0)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Handle quotes in CSV
                const match = line.match(/(?<=^|,)("([^"]*)"|([^,]*))(?=,|$)/g);
                if (!match) continue;
                
                const cols = match.map(m => m.replace(/^"|"$/g, '').trim());
                if (cols.length >= 5) {
                    const profileId = cols[0];
                    const markStr = cols[4];
                    const mark = parseFloat(markStr);
                    
                    if (profileId && !isNaN(mark)) {
                        newMarks[profileId] = mark;
                        matchCount++;
                    }
                }
            }

            setMarksData(prev => ({ ...prev, ...newMarks }));
            toast({ 
                title: 'Template Imported', 
                description: `Successfully loaded marks for ${matchCount} students. Review and click Save!` 
            });
        };
        reader.readAsText(file);
        // Reset input so the same file can be selected again if needed
        e.target.value = '';
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

                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={handleDownloadTemplate} 
                            disabled={!selectedSubject || students.length === 0}
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Excel Template
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleUploadTemplate}
                                disabled={!selectedSubject || students.length === 0}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                title="Upload filled template"
                            />
                            <Button 
                                variant="outline" 
                                disabled={!selectedSubject || students.length === 0}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 pointer-events-none w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Autofill Marks
                            </Button>
                        </div>
                    </div>
                    
                    <Button onClick={handleSave} disabled={isLoading || !selectedSubject || students.length === 0} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Marks
                    </Button>
                </div>
            </Card>

            {isFetchingStudents ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
            ) : selectedExamId && selectedSubject && selectedClass && selectedSection ? (
                students.length > 0 ? (
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
                    <div className="text-center py-10 text-orange-600 bg-orange-50 border-2 border-dashed border-orange-200 rounded-lg">
                        <strong>No students found!</strong><br/>
                        There are currently 0 students enrolled in Class {selectedClass} Section {selectedSection}.
                    </div>
                )
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
