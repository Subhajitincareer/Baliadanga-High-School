import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Subject {
    name: string;
    fullMarks: number;
}

interface ReportCardData {
    student: {
        name: string;
        studentId: string;
        rollNumber: string;
        class: string;
        section: string;
        session?: string;
    };
    exam: {
        name: string;
        type: string;
        academicYear: string;
        subjects: Subject[];
    };
    result: {
        marks: Record<string, number>;
        totalObtained: number;
        percentage: number;
        grade: string;
        rank?: number;
    } | null;
}

interface ReportCardPrintProps {
    data: ReportCardData | null;
    open: boolean;
    onClose: () => void;
    schoolName?: string;
}

const getGradeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return '#16a34a';
    if (grade === 'B') return '#2563eb';
    if (grade === 'C') return '#d97706';
    return '#dc2626';
};

export const ReportCardPrint: React.FC<ReportCardPrintProps> = ({
    data,
    open,
    onClose,
    schoolName = 'Baliadanga High School'
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!printRef.current) return;
        const content = printRef.current.innerHTML;
        const win = window.open('', '_blank', 'width=900,height=700');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Report Card — ${data?.student.name}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Georgia, serif; font-size: 13px; color: #1a1a1a; padding: 32px; }
                    .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 12px; margin-bottom: 16px; }
                    .school-name { font-size: 22px; font-weight: bold; letter-spacing: 1px; }
                    .school-sub { font-size: 12px; color: #555; margin-top: 4px; }
                    .report-title { font-size: 15px; font-weight: bold; margin: 12px 0; text-transform: uppercase; letter-spacing: 2px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; border: 1px solid #ccc; padding: 12px; background: #f9f9f9; }
                    .info-item { display: flex; gap: 6px; font-size: 12px; }
                    .info-label { font-weight: bold; min-width: 100px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                    th { background: #1e3a5f; color: white; padding: 8px 10px; font-size: 12px; text-align: left; }
                    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
                    tr:nth-child(even) td { background: #f3f4f6; }
                    .summary-row td { font-weight: bold; background: #e0f2fe !important; border-top: 2px solid #1e3a5f; }
                    .grade-badge { display: inline-block; font-weight: bold; font-size: 22px; padding: 4px 16px; border: 2px solid; border-radius: 6px; }
                    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; }
                    .sig-line { border-top: 1px solid #333; width: 160px; text-align: center; padding-top: 4px; }
                    @media print { body { padding: 16px; } }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        win.document.close();
        setTimeout(() => { win.print(); win.close(); }, 400);
    };

    if (!data) return null;

    const { student, exam, result } = data;
    const gradeColor = result ? getGradeColor(result.grade) : '#333';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Report Card — {student.name}</span>
                        <Button onClick={handlePrint} className="gap-2 mr-8" size="sm">
                            <Printer className="w-4 h-4" />
                            Print
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                {/* Printable area */}
                <div ref={printRef} className="p-6 space-y-4 font-serif text-gray-800">
                    {/* Header */}
                    <div className="text-center border-b-2 border-double border-gray-700 pb-4">
                        <div className="text-2xl font-bold tracking-wide">{schoolName}</div>
                        <div className="text-sm text-gray-500 mt-1">
                            Official Report Card — Academic Year {exam.academicYear}
                        </div>
                        <div className="report-title mt-3 text-lg font-bold uppercase tracking-widest text-school-primary">
                            {exam.name} — {exam.type}
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="info-grid grid grid-cols-2 gap-x-6 gap-y-2 border rounded-lg p-4 bg-gray-50 text-sm">
                        {[
                            ['Name', student.name],
                            ['Student ID', student.studentId],
                            ['Roll No.', student.rollNumber],
                            ['Class & Section', `${student.class} – ${student.section}`],
                            ['Session', student.session || '—'],
                            ['Exam', exam.name]
                        ].map(([label, value]) => (
                            <div key={label} className="info-item flex gap-2">
                                <span className="info-label font-semibold min-w-[110px]">{label}:</span>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Marks Table */}
                    {result ? (
                        <>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-school-primary text-white">
                                        <th className="text-left p-3">Subject</th>
                                        <th className="text-center p-3">Full Marks</th>
                                        <th className="text-center p-3">Obtained</th>
                                        <th className="text-center p-3">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exam.subjects.map((sub, i) => {
                                        const obtained = result.marks?.[sub.name] ?? 0;
                                        const subPct = sub.fullMarks > 0 ? (obtained / sub.fullMarks) * 100 : 0;
                                        const subGrade = subPct >= 90 ? 'A+' : subPct >= 75 ? 'A' : subPct >= 60 ? 'B' : subPct >= 45 ? 'C' : 'D';
                                        return (
                                            <tr key={sub.name} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                                                <td className="p-3 border-b">{sub.name}</td>
                                                <td className="p-3 border-b text-center">{sub.fullMarks}</td>
                                                <td className="p-3 border-b text-center font-semibold">{obtained}</td>
                                                <td className="p-3 border-b text-center">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded"
                                                        style={{ color: getGradeColor(subGrade), border: `1px solid ${getGradeColor(subGrade)}` }}>
                                                        {subGrade}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Summary row */}
                                    <tr className="bg-blue-50 font-bold border-t-2 border-school-primary">
                                        <td className="p-3">Total</td>
                                        <td className="p-3 text-center">
                                            {exam.subjects.reduce((s, sub) => s + sub.fullMarks, 0)}
                                        </td>
                                        <td className="p-3 text-center">{result.totalObtained}</td>
                                        <td className="p-3 text-center">—</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Overall result */}
                            <div className="flex items-center justify-between border rounded-lg p-4 bg-white">
                                <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Overall Percentage</div>
                                    <div className="text-3xl font-bold">{result.percentage.toFixed(1)}%</div>
                                    {result.rank && (
                                        <div className="text-sm text-muted-foreground">Rank: #{result.rank}</div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Final Grade</div>
                                    <div
                                        className="text-4xl font-bold px-6 py-2 rounded-lg border-2"
                                        style={{ color: gradeColor, borderColor: gradeColor }}
                                    >
                                        {result.grade}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No marks recorded for this student in this exam.
                        </p>
                    )}

                    {/* Footer */}
                    <div className="footer mt-10 flex justify-between text-xs text-gray-500 border-t pt-4">
                        <div>
                            <div className="font-semibold border-t border-gray-500 mt-12 pt-1">Class Teacher</div>
                        </div>
                        <div>
                            <div className="font-semibold border-t border-gray-500 mt-12 pt-1">Principal</div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReportCardPrint;
