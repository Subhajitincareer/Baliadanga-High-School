import React, { useMemo, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar } from 'lucide-react';

interface AttendanceRecord {
    date: string;         // ISO date string
    status: 'Present' | 'Absent' | 'Late' | 'Holiday' | string;
}

interface AttendanceDetailTableProps {
    attendanceData: AttendanceRecord[];
    studentName?: string;
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    Present: 'default',
    Late: 'secondary',
    Absent: 'destructive',
    Holiday: 'outline'
};

const statusColor: Record<string, string> = {
    Present:  'bg-green-100 text-green-800 border-green-200',
    Late:     'bg-amber-100 text-amber-800 border-amber-200',
    Absent:   'bg-red-100  text-red-800  border-red-200',
    Holiday:  'bg-blue-100 text-blue-700 border-blue-200'
};

export const AttendanceDetailTable: React.FC<AttendanceDetailTableProps> = ({
    attendanceData,
    studentName = ''
}) => {
    const allMonths = useMemo(() => {
        const months = new Set<string>();
        attendanceData.forEach(r => {
            const d = new Date(r.date);
            months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        });
        return Array.from(months).sort().reverse();
    }, [attendanceData]);

    const [selectedMonth, setSelectedMonth] = useState<string>(allMonths[0] || 'all');

    const filtered = useMemo(() =>
        attendanceData
            .filter(r => {
                if (selectedMonth === 'all' || !selectedMonth) return true;
                const d = new Date(r.date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [attendanceData, selectedMonth]
    );

    const stats = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
        const totalDays = filtered.filter(r => r.status !== 'Holiday').length;
        const presentDays = (counts['Present'] || 0) + (counts['Late'] || 0);
        const pct = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '—';
        return { counts, totalDays, presentDays, pct };
    }, [filtered]);

    const pctNum = parseFloat(stats.pct);
    const pctColor = isNaN(pctNum) ? 'text-gray-500' : pctNum >= 75 ? 'text-green-600' : pctNum >= 50 ? 'text-amber-600' : 'text-red-600';

    const downloadCSV = () => {
        const header = 'Date,Day,Status\n';
        const rows = filtered.map(r => {
            const d = new Date(r.date);
            return `${d.toLocaleDateString('en-IN')},${d.toLocaleDateString('en-IN', { weekday: 'long' })},${r.status}`;
        }).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `attendance_${studentName || 'student'}_${selectedMonth || 'all'}.csv`;
        link.click();
    };

    const monthLabel = (m: string) => {
        if (m === 'all' || !m) return 'All Months';
        const [y, mo] = m.split('-');
        return new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-4">
            {/* Filter + Download row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {allMonths.map(m => (
                                <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download CSV
                </Button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Present', count: stats.counts['Present'] || 0, color: 'text-green-600' },
                    { label: 'Late',    count: stats.counts['Late']    || 0, color: 'text-amber-600' },
                    { label: 'Absent',  count: stats.counts['Absent']  || 0, color: 'text-red-600' },
                    { label: 'Attendance %', count: `${stats.pct}%`, color: pctColor }
                ].map(({ label, count, color }) => (
                    <div key={label} className="text-center rounded-lg border p-3 bg-white">
                        <div className={`text-2xl font-bold ${color}`}>{count}</div>
                        <div className="text-xs text-muted-foreground mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Detail Table */}
            {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No records for this period.</p>
            ) : (
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((rec, idx) => {
                                const d = new Date(rec.date);
                                const colorClass = statusColor[rec.status] || 'bg-gray-100 text-gray-700 border-gray-200';
                                return (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">
                                            {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {d.toLocaleDateString('en-IN', { weekday: 'long' })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${colorClass}`}>
                                                {rec.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default AttendanceDetailTable;
