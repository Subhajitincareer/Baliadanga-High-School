import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Routine } from '@/services/api';

interface ClassScheduleGridProps {
    routines: Routine[];
    /** If provided, periods taught by this teacher are highlighted */
    highlightTeacher?: string;
    isLoading?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Returns ordinal suffix: 1 → "1st", 2 → "2nd" etc. */
const ordinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const ClassScheduleGrid: React.FC<ClassScheduleGridProps> = ({
    routines,
    highlightTeacher,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16 text-muted-foreground">
                Loading schedule…
            </div>
        );
    }

    if (!routines || routines.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No class schedule found yet.
            </div>
        );
    }

    const getPeriodsForDay = (day: string) => {
        const all: any[] = [];
        const myName = highlightTeacher?.trim().toLowerCase();

        routines.forEach(routine => {
            const dayEntry = routine.weekSchedule?.find((d: any) => d.day === day);
            if (!dayEntry) return;

            let periodIndex = 0;
            dayEntry.periods?.forEach((period: any) => {
                if (period.subject !== 'Tiffin') periodIndex++;
                const periodTeacher = period.teacher?.trim().toLowerCase();
                const isMine = myName ? periodTeacher === myName : false;

                all.push({
                    ...period,
                    className: routine.className,
                    section: routine.section,
                    periodLabel: period.subject === 'Tiffin' ? 'Tiffin' : `${ordinal(periodIndex)} Period`,
                    isMine
                });
            });
        });

        return all.sort((a, b) =>
            parseInt(a.startTime?.replace(':', '') || '0') -
            parseInt(b.startTime?.replace(':', '') || '0')
        );
    };

    const hasAnyPeriods = DAYS.some(day => getPeriodsForDay(day).length > 0);
    if (!hasAnyPeriods) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No periods scheduled yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {DAYS.map(day => {
                const periods = getPeriodsForDay(day);
                if (periods.length === 0) return null;

                return (
                    <Card key={day} className="overflow-hidden">
                        <CardHeader className="bg-slate-100 py-3">
                            <CardTitle className="text-base font-semibold">{day}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {periods.map((period, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 flex justify-between items-center transition-colors ${period.isMine
                                            ? 'bg-indigo-50 hover:bg-indigo-100'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        {/* Period label */}
                                        <div className="absolute top-2 right-2" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-school-primary text-sm">
                                                {highlightTeacher
                                                    ? `Class ${period.className}-${period.section}`
                                                    : period.subject}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {highlightTeacher ? period.subject : `${period.teacher || 'TBA'}`}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="font-mono text-xs font-bold text-gray-700">
                                                {period.startTime} – {period.endTime}
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                {period.periodLabel}
                                            </Badge>
                                            {period.roomNo && (
                                                <div className="text-[10px] text-muted-foreground">
                                                    Room {period.roomNo}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default ClassScheduleGrid;
