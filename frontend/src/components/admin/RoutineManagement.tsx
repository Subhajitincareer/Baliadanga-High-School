import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Save, Coffee, AlertCircle } from 'lucide-react';
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

const parseTime = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

// ── Conflict Map Type ──────────────────────────────────────────────────────────
// key: "Day|startTime|endTime" → Set of teacher names already assigned in OTHER classes
type ConflictMap = Record<string, { teacherName: string; className: string; section: string }[]>;

function buildConflictMap(allRoutines: Routine[], currentClassName: string, currentSection: string): ConflictMap {
    const map: ConflictMap = {};
    for (const r of allRoutines) {
        // Skip the current class being edited
        if (r.className === currentClassName && r.section === currentSection) continue;
        for (const daySchedule of r.weekSchedule) {
            for (const period of daySchedule.periods) {
                if (!period.teacher) continue;
                const key = `${daySchedule.day}|${period.startTime}|${period.endTime}`;
                if (!map[key]) map[key] = [];
                map[key].push({
                    teacherName: period.teacher,
                    className: r.className,
                    section: r.section,
                });
            }
        }
    }
    return map;
}

/** Returns conflict info if teacher is busy at this slot */
function getTeacherConflict(
    map: ConflictMap,
    day: string,
    startTime: string,
    endTime: string,
    teacherName: string
): { className: string; section: string } | null {
    const newStart = parseTime(startTime);
    const newEnd = parseTime(endTime);

    // Check all keys for overlapping times on same day
    for (const [key, entries] of Object.entries(map)) {
        const [kDay, kStart, kEnd] = key.split('|');
        if (kDay !== day) continue;
        const ks = parseTime(kStart);
        const ke = parseTime(kEnd);
        // Time overlap check
        if (newStart < ke && newEnd > ks) {
            const match = entries.find(e => e.teacherName === teacherName);
            if (match) return { className: match.className, section: match.section };
        }
    }
    return null;
}

export const RoutineManagement = () => {
    const [className, setClassName] = useState('X');
    const [section, setSection] = useState('A');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [allRoutines, setAllRoutines] = useState<Routine[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchRoutine();
        fetchStaff();
        fetchAllRoutines();
    }, [className, section]);

    const fetchStaff = async () => {
        try {
            const staff = await apiService.getStaff();
            setStaffList(staff.filter(s => s.isActive && (s.position === 'Teacher' || s.position === 'Principal' || s.position === 'Vice Principal')));
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const fetchAllRoutines = async () => {
        try {
            // Fetch all routines (no class/section filter) to build conflict map
            const data = await apiService.getRoutines('', '');
            setAllRoutines(data);
        } catch (error) {
            console.error('Error fetching all routines:', error);
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

    // Build conflict map from all OTHER routines
    const conflictMap = buildConflictMap(allRoutines, className, section);

    const handleAddPeriod = (dayIndex: number) => {
        if (!routine) return;
        const newRoutine = { ...routine };
        const dayPeriods = newRoutine.weekSchedule[dayIndex].periods;

        let startTime = '10:50';
        let endTime = '11:30';

        if (dayPeriods.length > 0) {
            const lastPeriod = dayPeriods[dayPeriods.length - 1];
            if (lastPeriod.endTime) {
                startTime = lastPeriod.endTime;
                const [h, m] = lastPeriod.endTime.split(':').map(Number);
                let newH = h;
                let newM = m + 40;
                if (newM >= 60) { newH += 1; newM -= 60; }
                endTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
            }
        }

        dayPeriods.push({ startTime, endTime, subject: 'Mathematics', teacher: '', roomNo: '' });
        setRoutine(newRoutine);
    };

    const handleAddTiffin = (dayIndex: number) => {
        if (!routine) return;
        const newRoutine = { ...routine };
        newRoutine.weekSchedule[dayIndex].periods.push({
            startTime: '13:30', endTime: '14:10', subject: 'Tiffin', teacher: '', roomNo: ''
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
            toast({ title: 'Success', description: 'Routine saved successfully.' });
            // Refresh all routines after save so conflict map updates
            fetchRoutine();
            fetchAllRoutines();
        } catch (error: any) {
            console.error('Save error:', error);
            toast({
                title: '⚠️ Conflict Detected',
                description: error.message || 'Failed to save routine.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Class & Section Selectors */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-40">
                    <Label>Class</Label>
                    <Select value={className} onValueChange={setClassName}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-40">
                    <Label>Section</Label>
                    <Select value={section} onValueChange={setSection}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSave} disabled={saving} className="ml-auto">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Routine
                </Button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md px-4 py-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                    <strong className="text-amber-700">Teacher Conflict Detection:</strong>{' '}
                    Teachers marked <span className="text-red-600 font-semibold">🔴 Busy</span> are already assigned in another class at the overlapping time on the same day.
                    They can still be selected but saving will be blocked by the server.
                </span>
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
                                                        {/* Period Label Badge */}
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

                                                        {/* Time Inputs */}
                                                        <div className="grid grid-cols-2 gap-2 mb-2 mt-2">
                                                            <div>
                                                                <Label className="text-xs">Start</Label>
                                                                <Input className="h-7 text-xs" value={period.startTime}
                                                                    onChange={e => handlePeriodChange(dayIndex, pIndex, 'startTime', e.target.value)} />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">End</Label>
                                                                <Input className="h-7 text-xs" value={period.endTime}
                                                                    onChange={e => handlePeriodChange(dayIndex, pIndex, 'endTime', e.target.value)} />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {/* Subject */}
                                                            <div className="pt-1">
                                                                <Label className="text-xs sr-only">Subject</Label>
                                                                <Select value={period.subject} onValueChange={v => handlePeriodChange(dayIndex, pIndex, 'subject', v)}>
                                                                    <SelectTrigger className="h-7 text-xs font-medium">
                                                                        <SelectValue placeholder="Subject" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {SUBJECTS.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            {/* ── Teacher Dropdown with Conflict Detection ── */}
                                                            <div>
                                                                <Label className="text-xs sr-only">Teacher</Label>
                                                                <Select
                                                                    value={period.teacher}
                                                                    onValueChange={v => handlePeriodChange(dayIndex, pIndex, 'teacher', v)}
                                                                    disabled={isTiffin}
                                                                >
                                                                    <SelectTrigger className={`h-7 text-xs ${period.teacher && getTeacherConflict(conflictMap, daySchedule.day, period.startTime, period.endTime, period.teacher) ? 'border-red-400 text-red-600' : ''}`}>
                                                                        <SelectValue placeholder={isTiffin ? 'No Teacher' : 'Select Teacher'}>
                                                                            {period.teacher && (() => {
                                                                                const conflict = getTeacherConflict(conflictMap, daySchedule.day, period.startTime, period.endTime, period.teacher);
                                                                                return (
                                                                                    <span className={conflict ? 'text-red-600 font-medium' : ''}>
                                                                                        {conflict ? '🔴 ' : '✅ '}{period.teacher}
                                                                                        {conflict && <span className="text-[10px] ml-1 opacity-80">(Class {conflict.className}-{conflict.section})</span>}
                                                                                    </span>
                                                                                );
                                                                            })()}
                                                                        </SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {staffList.length === 0 && (
                                                                            <SelectItem value="__none__" disabled>No teachers found</SelectItem>
                                                                        )}
                                                                        {staffList.map(teacher => {
                                                                            const conflict = getTeacherConflict(conflictMap, daySchedule.day, period.startTime, period.endTime, teacher.fullName);
                                                                            return (
                                                                                <SelectItem
                                                                                    key={teacher._id}
                                                                                    value={teacher.fullName}
                                                                                    className={conflict ? 'text-red-600 bg-red-50' : 'text-green-700'}
                                                                                    disabled={!!conflict}
                                                                                >
                                                                                    <div className="flex items-center justify-between w-full gap-2">
                                                                                        <span>
                                                                                            {conflict ? '🔴' : '🟢'} {teacher.fullName}
                                                                                            <span className="text-muted-foreground text-[10px] ml-1">({teacher.employeeId})</span>
                                                                                        </span>
                                                                                        {conflict && (
                                                                                            <Badge variant="destructive" className="text-[9px] px-1 py-0 ml-auto shrink-0">
                                                                                                Busy · Cls {conflict.className}-{conflict.section}
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                </SelectItem>
                                                                            );
                                                                        })}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            {/* Room No */}
                                                            <Input
                                                                placeholder="Room No"
                                                                className="h-7 text-xs"
                                                                value={period.roomNo || ''}
                                                                onChange={e => handlePeriodChange(dayIndex, pIndex, 'roomNo', e.target.value)}
                                                                disabled={isTiffin}
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
