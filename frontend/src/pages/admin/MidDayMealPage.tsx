import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Utensils, Save, CheckCircle2, BarChart3 } from 'lucide-react';
import apiService from '@/services/api';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '@/utils/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MidDayMealPage = () => {
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [students, setStudents] = useState<any[]>([]); // List of students
    const [mealTakers, setMealTakers] = useState<Set<string>>(new Set()); // Set of Student IDs taking meal
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mealDate, setMealDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryMonth, setSummaryMonth] = useState<string>(
        new Date().toISOString().slice(0, 7) // 'YYYY-MM'
    );

    const { toast } = useToast();

    const fetchStudents = async () => {
        if (!selectedClass || !selectedSection) {
            toast({ title: 'Select Class & Section', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            // Use the dedicated class-filter endpoint
            const data = await apiService.getStudentsByClass(selectedClass, selectedSection);
            setStudents(data);

            // Pre-fill from existing meal record for this date/class if any
            try {
                const existing = await apiService.getMealReport(mealDate, selectedClass);
                const existingArr = Array.isArray(existing) ? existing : [];
                const record = existingArr.find((r: any) =>
                    r.class === selectedClass && r.section === selectedSection
                );
                if (record?.studentIds?.length) {
                    setMealTakers(new Set(record.studentIds));
                } else {
                    setMealTakers(new Set());
                }
            } catch {
                setMealTakers(new Set());
            }
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

    const fetchMonthlySummary = async () => {
        setSummaryLoading(true);
        try {
            const res = await apiService.getMonthlySummary(summaryMonth);
            setMonthlySummary(res.data ?? []);
        } catch {
            setMonthlySummary([]);
        } finally {
            setSummaryLoading(false);
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
                                {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
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
                                {SECTION_OPTIONS.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
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

            {/* Monthly Summary Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" /> Monthly Meal Summary
                        </CardTitle>
                        <CardDescription>Aggregated meal counts per class for selected month.</CardDescription>
                    </div>
                    <input
                        type="month"
                        value={summaryMonth}
                        onChange={e => setSummaryMonth(e.target.value)}
                        className="border rounded p-2 text-sm"
                    />
                </CardHeader>
                <CardContent>
                    {summaryLoading ? (
                        <div className="flex justify-center py-6"><Loader2 className="animate-spin h-6 w-6" /></div>
                    ) : monthlySummary.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No meal data for this month.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Meal Days</TableHead>
                                    <TableHead>Total Meals</TableHead>
                                    <TableHead>Avg / Day</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlySummary.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.class}</TableCell>
                                        <TableCell>{row.section}</TableCell>
                                        <TableCell>{row.mealDays}</TableCell>
                                        <TableCell className="font-bold">{row.totalMeals}</TableCell>
                                        <TableCell>{row.avgPerDay}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MidDayMealPage;
