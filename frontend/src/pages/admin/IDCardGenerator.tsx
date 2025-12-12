import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Printer, Search } from 'lucide-react';
import { StudentIDCard } from '@/components/admin/StudentIDCard';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const IDCardGenerator = () => {
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedSection, setSelectedSection] = useState<string>("A");
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    const fetchStudents = async () => {
        if (!selectedClass) {
            toast({ title: "Please select a class", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Fetch all students and filter client-side for now
            // Ideally backend should support /api/students?class=X&section=A
            const data = await apiService.getStudents();
            const filtered = data.filter((s: any) =>
                // Check if class matches (assuming s.class or s.studentProfile.class exists)
                // Adjusting based on likely API response structure from previous files
                (s.class === selectedClass || s.studentProfile?.class === selectedClass) &&
                (!selectedSection || s.section === selectedSection || s.studentProfile?.section === selectedSection)
            );

            // Map to required format if needed
            const formatted = filtered.map((s: any) => ({
                studentId: s.studentId || s.employeeId || "UNKNOWN",
                fullName: s.name || s.fullName,
                class: s.class || selectedClass,
                section: s.section || selectedSection,
                rollNumber: s.rollNumber || s.studentProfile?.rollNumber || "-",
                bloodGroup: s.bloodGroup || s.studentProfile?.bloodGroup,
                contactNumber: s.phoneNumber || s.studentProfile?.contactNumber || s.email,
                address: s.address || s.studentProfile?.address,
                dateOfBirth: s.dateOfBirth || s.studentProfile?.dateOfBirth,
                photoUrl: s.photoUrl || s.avatar // Assuming photo field
            }));

            if (formatted.length === 0) {
                toast({ title: "No students found", description: "Try a different class or section." });
            }

            setStudents(formatted);
        } catch (error) {
            console.error(error);
            toast({ title: "Error fetching students", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Control Panel - Hidden during print */}
            <Card className="print:hidden">
                <CardHeader>
                    <CardTitle>Student ID Card Generator</CardTitle>
                    <CardDescription>Generate and print ID cards in bulk.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="space-y-2 w-full md:w-40">
                            <label className="text-sm font-medium">Class</label>
                            <Select onValueChange={setSelectedClass} value={selectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["5", "6", "7", "8", "9", "10", "11", "12"].map(c =>
                                        <SelectItem key={c} value={c}>Class {c}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 w-full md:w-40">
                            <label className="text-sm font-medium">Section</label>
                            <Select onValueChange={setSelectedSection} value={selectedSection}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["A", "B", "C", "D"].map(s =>
                                        <SelectItem key={s} value={s}>Section {s}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={fetchStudents} disabled={loading} className="w-full md:w-auto">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Fetch Students
                        </Button>

                        <Button onClick={handlePrint} disabled={students.length === 0} variant="outline" className="w-full md:w-auto ml-auto">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Cards
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preview / Print Area */}
            {students.length > 0 && (
                <div className="bg-gray-100 p-8 rounded-lg min-h-[500px] print:bg-white print:p-0 print:m-0">
                    <div ref={printRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:w-full">
                        <style type="text/css" media="print">
                            {`
                                @page { size: A4; margin: 10mm; }
                                body * { visibility: hidden; }
                                #printable-content, #printable-content * { visibility: visible; }
                                #printable-content { position: absolute; left: 0; top: 0; width: 100%; }
                            `}
                        </style>
                        <div id="printable-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 w-full">
                            {students.map((student, index) => (
                                <div key={index} className="break-inside-avoid page-break-inside-avoid">
                                    <StudentIDCard student={student} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {students.length === 0 && !loading && (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                    Select a class and fetch students to generate cards.
                </div>
            )}
        </div>
    );
};
