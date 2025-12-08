import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ExamManagement = () => {
    const { toast } = useToast();
    const [exams, setExams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        session: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        class: '',
        subjects: [{ name: '', fullMarks: 100, passMarks: 30 }]
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await apiService.getExams();
            setExams(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubjectChange = (index: number, field: string, value: any) => {
        const newSubjects = [...formData.subjects];
        newSubjects[index] = { ...newSubjects[index], [field]: value };
        setFormData({ ...formData, subjects: newSubjects });
    };

    const addSubject = () => {
        setFormData({
            ...formData,
            subjects: [...formData.subjects, { name: '', fullMarks: 100, passMarks: 30 }]
        });
    };

    const removeSubject = (index: number) => {
        const newSubjects = formData.subjects.filter((_, i) => i !== index);
        setFormData({ ...formData, subjects: newSubjects });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiService.createExam(formData);
            toast({ title: "Success", description: "Exam created successfully" });
            setIsDialogOpen(false);
            fetchExams();
            // Reset form
            setFormData({
                name: '',
                session: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                class: '',
                subjects: [{ name: '', fullMarks: 100, passMarks: 30 }]
            });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to create exam", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Exam Management</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Exam</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Exam</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Exam Name</Label>
                                    <Input placeholder="e.g. Annual Exam 2024" required
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Session</Label>
                                    <Input placeholder="2024-2025" required
                                        value={formData.session} onChange={(e) => setFormData({ ...formData, session: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Class</Label>
                                    <Input placeholder="e.g. 10" required
                                        value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2 border p-4 rounded-md bg-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-lg font-semibold">Subjects</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addSubject}>Add Subject</Button>
                                </div>
                                {formData.subjects.map((subject, index) => (
                                    <div key={index} className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs">Subject Name</Label>
                                            <Input placeholder="Math" required
                                                value={subject.name} onChange={(e) => handleSubjectChange(index, 'name', e.target.value)} />
                                        </div>
                                        <div className="w-24">
                                            <Label className="text-xs">Full Marks</Label>
                                            <Input type="number" required
                                                value={subject.fullMarks} onChange={(e) => handleSubjectChange(index, 'fullMarks', Number(e.target.value))} />
                                        </div>
                                        <div className="w-24">
                                            <Label className="text-xs">Pass Marks</Label>
                                            <Input type="number" required
                                                value={subject.passMarks} onChange={(e) => handleSubjectChange(index, 'passMarks', Number(e.target.value))} />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeSubject(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Exam'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                    <Card key={exam._id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">
                                {exam.name}
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold text-school-primary mb-2">{exam.session} - Class {exam.class}</div>
                            <div className="text-xs text-muted-foreground mb-4">
                                {exam.subjects.length} Subjects configured
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className={`px-2 py-1 rounded-full ${exam.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {exam.isPublished ? 'Published' : 'Draft'}
                                </span>
                                <Button variant="link" size="sm">View Details</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ExamManagement;
