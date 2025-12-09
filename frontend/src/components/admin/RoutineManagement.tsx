import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, Coffee } from 'lucide-react';
import apiService, { Routine, Staff } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CLASSES = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const SECTIONS = ['A', 'B', 'C', 'Science', 'Arts', 'Commerce'];
const SUBJECTS = [
    'Bengali', 'English', 'Mathematics', 'Physical Science', 'Life Science',
    'History', 'Geography', 'Computer Application', 'Physics', 'Chemistry',
    'Biology', 'Accountancy', 'Business Studies', 'Economics', 'Political Science',
    'Philosophy', 'Sanskrit', 'Education', 'Environmental Studies', 'Work Education',
    'Physical Education', 'Tiffin'
];

// Helper for ordinal suffix
const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const RoutineManagement = () => {
    const [className, setClassName] = useState('X');
    const [section, setSection] = useState('A');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchRoutine();
        fetchStaff();
    }, [className, section]);

    const fetchStaff = async () => {
        try {
            const staff = await apiService.getStaff();
            setStaffList(staff.filter(s => s.isActive && (s.position === 'Teacher' || s.position === 'Principal' || s.position === 'Vice Principal')));
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const fetchRoutine = async () => {
        setLoading(true);
        try {
            const data = await apiService.getRoutines(className, section);
            if (data && data.length > 0) {
                setRoutine(data[0]);
            } else {
                setRoutine({
                    _id: '',
                    className,
                    section,
                    weekSchedule: DAYS.map(day => ({ day, periods: [] }))
                });
            }
        } catch (error) {
            console.error('Error fetching routine:', error);
            setRoutine({
                _id: '',
                className,
                section,
                weekSchedule: DAYS.map(day => ({ day, periods: [] }))
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddPeriod = (dayIndex: number) => {
        if (!routine) return;
        const newRoutine = { ...routine };
        const dayPeriods = newRoutine.weekSchedule[dayIndex].periods;

        // Smart start time calculation
        let startTime = '10:50';
        let endTime = '11:30';

        if (dayPeriods.length > 0) {
            const lastPeriod = dayPeriods[dayPeriods.length - 1];
            if (lastPeriod.endTime) {
                startTime = lastPeriod.endTime;
                // Add 40 mins default
                const [h, m] = lastPeriod.endTime.split(':').map(Number);
                let newH = h;
                let newM = m + 40;
                if (newM >= 60) {
                    newH += 1;
                    newM -= 60;
                }
                endTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
            }
        }

        dayPeriods.push({
            startTime,
            endTime,
            subject: 'Mathematics',
            teacher: '',
            roomNo: ''
        });
        setRoutine(newRoutine);
    };

    const handleAddTiffin = (dayIndex: number) => {
        if (!routine) return;
        const newRoutine = { ...routine };
        newRoutine.weekSchedule[dayIndex].periods.push({
            startTime: '13:30',
            endTime: '14:10',
            subject: 'Tiffin',
            teacher: '',
            roomNo: ''
        });
        setRoutine(newRoutine);
    };

    const handleRemovePeriod = (dayIndex: number, periodIndex: number) => {
        if (!routine) return;
        const newRoutine = { ...routine };
        newRoutine.weekSchedule[dayIndex].periods.splice(periodIndex, 1);
        setRoutine(newRoutine);
    };

    const handlePeriodChange = (dayIndex: number, periodIndex: number, field: string, value: string) => {
        if (!routine) return;
        const newRoutine = { ...routine };
        const period = newRoutine.weekSchedule[dayIndex].periods[periodIndex];

        (period as any)[field] = value;

        // Smart logic for Tiffin
        if (field === 'subject' && value === 'Tiffin') {
            period.teacher = '';
            period.roomNo = '';
        }

        setRoutine(newRoutine);
    };

    const handleSave = async () => {
        if (!routine) return;
        setSaving(true);
        try {
            await apiService.saveRoutine(routine);
            toast({
                title: 'Success',
                description: 'Routine saved successfully.',
            });
            fetchRoutine();
        } catch (error: any) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to save routine.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-40">
                    <Label>Class</Label>
                    <Select value={className} onValueChange={setClassName}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-40">
                    <Label>Section</Label>
                    <Select value={section} onValueChange={setSection}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSave} disabled={saving} className="ml-auto">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Routine
                </Button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="space-y-8">
                    {routine?.weekSchedule.map((daySchedule, dayIndex) => (
                        <Card key={daySchedule.day}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle>{daySchedule.day}</CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleAddTiffin(dayIndex)} className="border-yellow-200 hover:bg-yellow-50 text-yellow-700">
                                            <Coffee className="h-4 w-4 mr-1" /> Add Tiffin
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleAddPeriod(dayIndex)}>
                                            <Plus className="h-4 w-4 mr-1" /> Add Period
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {daySchedule.periods.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground text-sm">No periods scheduled.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(() => {
                                            let periodCounter = 0;
                                            return daySchedule.periods.map((period, pIndex) => {
                                                const isTiffin = period.subject === 'Tiffin';
                                                if (!isTiffin) periodCounter++;

                                                return (
                                                    <div key={pIndex} className={`p-3 rounded-md border text-sm relative group ${isTiffin ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
                                                        {/* Label Badge */}
                                                        <div className={`absolute -top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isTiffin ? 'bg-yellow-200 text-yellow-800' : 'bg-slate-200 text-slate-700'}`}>
                                                            {isTiffin ? 'TIFFIN' : `${getOrdinal(periodCounter)} Period`}
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleRemovePeriod(dayIndex, pIndex)}
                                                        >
                                                            <Trash2 className="h-3 w-3 text-red-500" />
                                                        </Button>
                                                        <div className="grid grid-cols-2 gap-2 mb-2 mt-2">
                                                            <div>
                                                                <Label className="text-xs">Start</Label>
                                                                <Input
                                                                    className="h-7 text-xs"
                                                                    value={period.startTime}
                                                                    onChange={e => handlePeriodChange(dayIndex, pIndex, 'startTime', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">End</Label>
                                                                <Input
                                                                    className="h-7 text-xs"
                                                                    value={period.endTime}
                                                                    onChange={e => handlePeriodChange(dayIndex, pIndex, 'endTime', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="pt-1">
                                                                <Label className="text-xs sr-only">Subject</Label>
                                                                <Select
                                                                    value={period.subject}
                                                                    onValueChange={v => handlePeriodChange(dayIndex, pIndex, 'subject', v)}
                                                                >
                                                                    <SelectTrigger className="h-7 text-xs font-medium">
                                                                        <SelectValue placeholder="Subject" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {SUBJECTS.map(sub => (
                                                                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs sr-only">Teacher</Label>
                                                                <Select
                                                                    value={period.teacher}
                                                                    onValueChange={v => handlePeriodChange(dayIndex, pIndex, 'teacher', v)}
                                                                    disabled={period.subject === 'Tiffin'}
                                                                >
                                                                    <SelectTrigger className="h-7 text-xs">
                                                                        <SelectValue placeholder={period.subject === 'Tiffin' ? "No Teacher" : "Teacher"} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {staffList.map(teacher => (
                                                                            <SelectItem key={teacher._id} value={teacher.fullName}>
                                                                                {teacher.fullName} ({teacher.employeeId})
                                                                            </SelectItem>
                                                                        ))}
                                                                        {staffList.length === 0 && <SelectItem value="disabled" disabled>No teachers found</SelectItem>}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Input
                                                                placeholder="Room No"
                                                                className="h-7 text-xs"
                                                                value={period.roomNo || ''}
                                                                onChange={e => handlePeriodChange(dayIndex, pIndex, 'roomNo', e.target.value)}
                                                                disabled={period.subject === 'Tiffin'}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
