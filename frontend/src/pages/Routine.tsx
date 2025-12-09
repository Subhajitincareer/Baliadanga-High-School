import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar, Printer, Search } from 'lucide-react';
import apiService, { Routine } from '@/services/api';

const CLASSES = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const SECTIONS = ['A', 'B', 'C', 'Science', 'Arts', 'Commerce'];

// Helper for ordinal suffix
const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const RoutinePage = () => {
    const [className, setClassName] = useState('X');
    const [section, setSection] = useState('A');
    const [loading, setLoading] = useState(false);
    const [routine, setRoutine] = useState<Routine | null>(null);

    const fetchRoutine = async () => {
        setLoading(true);
        try {
            const data = await apiService.getRoutines(className, section);
            if (data && data.length > 0) {
                setRoutine(data[0]);
            } else {
                setRoutine(null);
            }
        } catch (error) {
            console.error('Error fetching routine:', error);
            setRoutine(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchRoutine();
    };

    const handlePrint = () => {
        window.print();
    };

    // Auto-fetch on mount with default values
    useEffect(() => {
        fetchRoutine();
    }, []);

    return (
        <div className="container py-8 max-w-6xl mx-auto">
            <div className="mb-8 text-center print:hidden">
                <h1 className="text-3xl font-bold text-school-primary mb-2">Class Routines</h1>
                <p className="text-muted-foreground">Select your class and section to view the weekly timetable.</p>
            </div>

            {/* Search Controls */}
            <Card className="mb-8 print:hidden">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end justify-center">
                        <div className="w-full md:w-40">
                            <Label htmlFor="class-select">Class</Label>
                            <Select value={className} onValueChange={setClassName}>
                                <SelectTrigger id="class-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-40">
                            <Label htmlFor="section-select">Section</Label>
                            <Select value={section} onValueChange={setSection}>
                                <SelectTrigger id="section-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSearch} className="w-full md:w-auto">
                            <Search className="mr-2 h-4 w-4" /> View Routine
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Routine Display */}
            <div className="print:block">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : !routine ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No routine found</h3>
                        <p className="text-gray-500">
                            No routine has been uplodaed for Class {className} - Section {section} yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-school-primary">
                                    Class {routine.className} - Section {routine.section}
                                </h2>
                                <p className="text-sm text-gray-500">Weekly Timetable</p>
                            </div>
                            <Button variant="outline" onClick={handlePrint} className="print:hidden">
                                <Printer className="mr-2 h-4 w-4" /> Print Routine
                            </Button>
                        </div>

                        <div className="overflow-x-auto border rounded-lg shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-center border-r bg-gray-200">Day</th>
                                        <th className="px-6 py-3 font-medium text-center">Periods</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routine.weekSchedule.map((daySchedule, idx) => (
                                        <tr key={daySchedule.day} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="px-6 py-4 font-bold text-gray-900 border-r text-center w-32 bg-gray-100">
                                                {daySchedule.day}
                                            </td>
                                            <td className="px-6 py-4">
                                                {daySchedule.periods.length === 0 ? (
                                                    <span className="text-gray-400 italic">No classes scheduled</span>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {(() => {
                                                            let periodCounter = 0;
                                                            return daySchedule.periods.map((period, pIdx) => {
                                                                if (period.subject === 'Tiffin') {
                                                                    return (
                                                                        <div key={pIdx} className="bg-yellow-100 border-yellow-200 border rounded-md p-3 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[80px]">
                                                                            <div className="text-xs text-yellow-700 font-mono mb-1">
                                                                                {period.startTime} - {period.endTime}
                                                                            </div>
                                                                            <div className="font-bold text-yellow-800 uppercase tracking-wider text-sm">
                                                                                Tiffin Break
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                periodCounter++;
                                                                return (
                                                                    <div key={pIdx} className="bg-white border rounded-md p-3 shadow-sm hover:shadow-md transition-shadow relative pt-5">
                                                                        {/* Period Label */}
                                                                        <div className="absolute top-0 left-0 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-br-md">
                                                                            {getOrdinal(periodCounter)} Period
                                                                        </div>

                                                                        <div className="flex justify-between text-xs text-gray-500 mb-1 font-mono mt-2">
                                                                            <span>{period.startTime}</span>
                                                                            <span>-</span>
                                                                            <span>{period.endTime}</span>
                                                                        </div>
                                                                        <div className="font-bold text-school-primary truncate" title={period.subject}>
                                                                            {period.subject}
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 truncate" title={period.teacher}>
                                                                            {period.teacher}
                                                                        </div>
                                                                        {period.roomNo && (
                                                                            <div className="text-[10px] text-gray-400 mt-1">
                                                                                Room: {period.roomNo}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 text-center text-xs text-muted-foreground print:block hidden">
                            <p>Generated via Baliadanga High Hub Portal on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoutinePage;
