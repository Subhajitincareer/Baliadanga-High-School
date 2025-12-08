import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Student {
    _id: string;
    fullName: string;
    email: string;
    // Add rollNumber if we add it to User model later
}



interface Exam {
    _id: string;
    name: string;
    subjects: { name: string; fullMarks: number }[];
}

const MarksEntry = () => {
    const { toast } = useToast();
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    // Filters
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    // Marks Data: map[studentId] -> marks
    const [marksData, setMarksData] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [examsData, studentsData] = await Promise.all([
                apiService.getExams(),
                apiService.getStudents()
            ]);
            setExams(examsData);
            setStudents(studentsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({ title: "Error", description: "Failed to load exams or students", variant: "destructive" });
        }
    };

    const handleMarkChange = (studentId: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setMarksData(prev => ({ ...prev, [studentId]: numValue }));
        }
    };

    const handleSave = async () => {
        if (!selectedExamId || !selectedSubject) {
            toast({ title: "Error", description: "Please select Exam and Subject", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            // We need to save per student. For basic bulk, we loop. 
            // Better: update backend to accept array. But current backend is `updateMarks` (one student).
            // Let's loop for now (Prototype).

            const promises = Object.entries(marksData).map(([studentId, marks]) => {
                // Construct marks object expected by backend: { "Math": 90 }
                const marksPayload = { [selectedSubject]: marks };

                return apiService.updateMarks({
                    studentId,
                    examId: selectedExamId,
                    marks: marksPayload
                });
            });

            await Promise.all(promises);
            toast({ title: "Success", description: "Marks saved successfully!" });
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: "Some marks failed to save", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedExam = exams.find(e => e._id === selectedExamId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Marks Entry</h2>

            <Card className="p-4 bg-slate-50 border-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Select Exam</Label>
                        <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Exam" />
                            </SelectTrigger>
                            <SelectContent>
                                {exams.map(exam => (
                                    <SelectItem key={exam._id} value={exam._id}>{exam.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Subject</Label>
                        <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedExamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedExam?.subjects.map(sub => (
                                    <SelectItem key={sub.name} value={sub.name}>{sub.name} (Max: {sub.fullMarks})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button className="w-full" onClick={handleSave} disabled={isLoading || !selectedSubject}>
                            <Save className="mr-2 h-4 w-4" /> Save All Marks
                        </Button>
                    </div>
                </div>
            </Card>

            {selectedExamId && selectedSubject ? (
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Roll No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Marks obtained</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student, index) => (
                                <TableRow key={student._id}>
                                    <TableCell>{index + 1}</TableCell> {/* Placeholder Roll */}
                                    <TableCell className="font-medium">{student.fullName}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            className="w-24"
                                            placeholder="0"
                                            onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow >
                            ))}
                        </TableBody >
                    </Table >
                </div >
            ) : (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    Select Exam and Subject to start entering marks.
                </div>
            )}
        </div >
    );
};

export default MarksEntry;
