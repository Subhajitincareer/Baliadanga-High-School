import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Calendar, BookOpen } from 'lucide-react';
import apiService, { Homework } from '@/services/api';
import { useStaff } from '@/contexts/StaffContext';

const CLASSES = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const SECTIONS = ['A', 'B', 'C', 'Science', 'Arts', 'Commerce'];
const SUBJECTS = [
    'Bengali', 'English', 'Mathematics', 'Physical Science', 'Life Science',
    'History', 'Geography', 'Computer Application', 'Physics', 'Chemistry',
    'Biology', 'Accountancy', 'Business Studies', 'Economics', 'Political Science',
    'Philosophy', 'Sanskrit'
];

export const HomeworkAssignment = () => {
    const { user } = useStaff();
    const { toast } = useToast();
    
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [subject, setSubject] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (user?._id) {
            fetchMyHomeworks();
        }
    }, [user]);

    const fetchMyHomeworks = async () => {
        setLoading(true);
        try {
            const data = await apiService.getHomeworks({ teacherId: user?._id });
            setHomeworks(data);
        } catch (error) {
            console.error('Error fetching homeworks:', error);
            toast({
                title: 'Error',
                description: 'Failed to load homework assignments.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title || !description || !className || !section || !subject || !dueDate) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiService.createHomework({
                title,
                description,
                className,
                section,
                subject,
                dueDate
            });
            
            toast({
                title: 'Success',
                description: 'Homework assigned successfully!',
            });
            
            // Reset form
            setTitle('');
            setDescription('');
            setClassName('');
            setSection('');
            setSubject('');
            setDueDate('');
            
            // Refresh list
            fetchMyHomeworks();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to assign homework.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this homework assignment?')) return;
        
        try {
            await apiService.deleteHomework(id);
            toast({
                title: 'Deleted',
                description: 'Homework assignment removed.',
            });
            fetchMyHomeworks();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete homework.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Assign New Homework</CardTitle>
                    <CardDescription>Create a new assignment for your students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAssign} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Assignment Title</Label>
                                <Input 
                                    id="title" 
                                    placeholder="e.g. Chapter 5: Exponent Laws" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <div className="relative">
                                    <Input 
                                        id="dueDate" 
                                        type="date" 
                                        value={dueDate} 
                                        onChange={(e) => setDueDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Select Class</Label>
                                <Select value={className} onValueChange={setClassName}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Select Section</Label>
                                <Select value={section} onValueChange={setSection}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select value={subject} onValueChange={setSubject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUBJECTS.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Instructions / Description</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Describe what the students need to do..." 
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-school-primary">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Assign Homework
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Recent Assignments</h3>
                
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : homeworks.length === 0 ? (
                    <Card className="bg-muted/50">
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground">You haven't assigned any homework yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {homeworks.map((hw) => (
                            <Card key={hw._id} className="relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-school-primary"></div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                                                Class {hw.className} - {hw.section}
                                            </Badge>
                                            <CardTitle className="text-base line-clamp-1" title={hw.title}>{hw.title}</CardTitle>
                                            <CardDescription className="text-xs mt-1 font-medium">{hw.subject}</CardDescription>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => hw._id && handleDelete(hw._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {hw.description}
                                    </p>
                                    <div className="flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded inline-flex">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
