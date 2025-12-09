import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CalendarDays } from 'lucide-react';

interface AttendanceGraphProps {
    attendanceData?: Record<string, 'present' | 'absent' | 'holiday'>;
    year?: number;
}

export const AttendanceGraph = ({ attendanceData = {}, year = new Date().getFullYear() }: AttendanceGraphProps) => {
    // Generate days for the year
    const generateDays = (year: number) => {
        const days = [];
        const date = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        while (date <= endDate) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const days = generateDays(year);

    // Group days by week
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Fill initial empty days if year doesn't start on Sunday
    const firstDay = days[0].getDay();
    for (let i = 0; i < firstDay; i++) {
        currentWeek.push(new Date(year - 1, 11, 31 - (firstDay - 1) + i)); // Dummy dates from prev year
    }

    days.forEach((day) => {
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });

    // Push remaining days
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(new Date(year + 1, 0, currentWeek.length - currentWeek.indexOf(days[days.length - 1])));
        }
        weeks.push(currentWeek);
    }

    // Mock data generator if no data provided
    const getStatus = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        if (attendanceData[dateString]) return attendanceData[dateString];

        // Mock logic: Weekends off, random attendance otherwise
        const day = date.getDay();
        if (day === 0 || day === 6) return 'holiday';

        // Deterministic mock based on date hash
        const hash = date.getTime() % 100;
        if (hash > 90) return 'absent';
        if (hash > 85) return 'late';
        return 'present';
    };

    const getColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-500 hover:bg-green-600';
            case 'absent': return 'bg-red-500 hover:bg-red-600';
            case 'holiday': return 'bg-gray-200 hover:bg-gray-300';
            case 'late': return 'bg-yellow-500 hover:bg-yellow-600';
            default: return 'bg-gray-100'; // Future dates
        }
    };

    const getLabel = (status: string) => {
        switch (status) {
            case 'present': return 'Present';
            case 'absent': return 'Absent';
            case 'holiday': return 'Holiday/Weekend';
            case 'late': return 'Late';
            default: return 'No Data';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            Attendance Overview
                        </CardTitle>
                        <CardDescription>Attendance record for {year}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span>Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            <span>Absent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                            <span>Late</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                            <span>Holiday</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <TooltipProvider>
                        <div className="flex gap-1 min-w-max pb-4">
                            {/* Transpose the grid: Columns should be weeks, Rows should be days of week */}
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {week.map((day, dayIndex) => {
                                        const isCurrentYear = day.getFullYear() === year;
                                        const status = isCurrentYear ? getStatus(day) : 'disabled';
                                        const formattedDate = day.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

                                        if (!isCurrentYear) return <div key={dayIndex} className="w-3 h-3" />; // Spacer

                                        return (
                                            <Tooltip key={dayIndex}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "w-3 h-3 rounded-[2px] transition-colors cursor-pointer",
                                                            getColor(status)
                                                        )}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-semibold">{formattedDate}</p>
                                                    <p className="text-xs uppercase text-muted-foreground">{getLabel(status)}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};
