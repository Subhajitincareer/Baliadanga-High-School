import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Utensils, Save, CheckCircle2 } from 'lucide-react';
import apiService from '@/services/api';
import { classOptions, sectionOptions } from '@/utils/constants'; // Assuming these exist, else iterate numbers
import { Checkbox } from '@/components/ui/checkbox';

const MidDayMealPage = () => {
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [students, setStudents] = useState<any[]>([]); // List of students
    const [mealTakers, setMealTakers] = useState<Set<string>>(new Set()); // Set of Student IDs taking meal
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mealDate, setMealDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const { toast } = useToast();

    // Classes 1-12
    const classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const sections = ['A', 'B', 'C'];

    const fetchStudents = async () => {
        if (!selectedClass || !selectedSection) {
            toast({ title: 'Select Class & Section', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            // 1. Fetch Students of this class/section
            // Use existing getStudents with filters? Need to check apiService capabilities.
            // Assuming getStudents returns all, we filter client side or backend supports query params.
            // Let's assume we fetch all for now and filter, or better, implement filter in getStudents if needed.
            // Since StudentManagement uses getStudents, let's see if we can reuse or just fetch all.
            // A better approach is to use the existing attendance fetch logic or just getStudents.

            // Optimization: If getStudents is heavy, we should have a lightweight endpoint.
            // For now, let's use getStudents() and filter client-side as per previous conversation context.
            const allStudents = await apiService.getStudents();
            const filtered = (allStudents as any[]).filter(
                s => s.class === selectedClass && s.section === selectedSection
            );

            setStudents(filtered);

            // 2. Fetch existing meal record for today to pre-fill
            // TODO: Add getMealReport to apiService logic or just try to fetch
            // const existingRecord = await apiService.getMealReport(mealDate, selectedClass, selectedSection);
            // if (existingRecord) setMealTakers(new Set(existingRecord.studentIds));

            // Default: All unchecked.
            setMealTakers(new Set());

        } catch (error: any) {
            console.error(error);
            toast({ title: 'Error fetching data', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStudent = (studentId: string) => {
        const newSet = new Set(mealTakers);
        if (newSet.has(studentId)) {
            newSet.delete(studentId);
        } else {
            newSet.add(studentId);
        }
        setMealTakers(newSet);
    };

    const handleSave = async () => {
        if (!selectedClass || !selectedSection) return;
        setIsSaving(true);
        try {
            await apiService.markMidDayMeal({
                date: mealDate,
                selectedClass,
                section: selectedSection,
                studentIds: Array.from(mealTakers)
            });

            toast({
                title: 'Meal Register Saved',
                description: `Total ${mealTakers.size} meals recorded.`
            });
        } catch (error: any) {
            toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setMealTakers(new Set(students.map(s => s.studentId)));
        } else {
            setMealTakers(new Set());
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mid-Day Meal Register</h2>
                    <p className="text-muted-foreground">Track daily meal consumption.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Date:</span>
                    <input
                        type="date"
                        value={mealDate}
                        onChange={(e) => setMealDate(e.target.value)}
                        className="border rounded p-2 text-sm"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Select Classroom</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2 min-w-[120px]">
                        <label className="text-sm font-medium">Class</label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 min-w-[120px]">
                        <label className="text-sm font-medium">Section</label>
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={fetchStudents} disabled={isLoading || !selectedClass || !selectedSection}>
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Fetch Students
                    </Button>
                </CardContent>
            </Card>

            {students.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Student List ({students.length})</CardTitle>
                            <CardDescription>Check the box if student is taking meal.</CardDescription>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-school-primary">{mealTakers.size}</span>
                            <span className="text-muted-foreground ml-2">Meals</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center space-x-2 border-b pb-4">
                            <Checkbox
                                id="select-all"
                                checked={mealTakers.size === students.length && students.length > 0}
                                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Select All / Deselect All
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map((student) => (
                                <div
                                    key={student.studentId}
                                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${mealTakers.has(student.studentId) ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-slate-50'}`}
                                    onClick={() => toggleStudent(student.studentId)}
                                >
                                    <Checkbox
                                        id={student.studentId}
                                        checked={mealTakers.has(student.studentId)}
                                        onCheckedChange={() => toggleStudent(student.studentId)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{student.name || student.fullName}</p>
                                        <p className="text-xs text-muted-foreground">Roll: {student.rollNumber} | ID: {student.studentId}</p>
                                    </div>
                                    <Utensils className={`h-4 w-4 ${mealTakers.has(student.studentId) ? 'text-green-600' : 'text-slate-300'}`} />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button size="lg" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Meal Record
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MidDayMealPage;
