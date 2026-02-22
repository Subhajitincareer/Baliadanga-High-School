import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import apiService from '@/services/api';
import { Loader2, CheckCircle2, XCircle, QrCode } from 'lucide-react';

const AttendancePage = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("manual");

    // Manual State
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, string>>({}); // studentId -> status
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [quickAbsentInput, setQuickAbsentInput] = useState("");

    // QR State
    const [scanResult, setScanResult] = useState("");
    const [lastScanned, setLastScanned] = useState("");
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Load students when class+section change
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchStudents();
        }
    }, [selectedClass, selectedSection]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const data = await apiService.getStudentsByClass(selectedClass, selectedSection);
            setStudents(data);

            // Initialize all as Present by default
            const initialStatus: Record<string, string> = {};
            data.forEach((s: any) => {
                initialStatus[s._id] = 'Present';
            });
            setAttendanceData(initialStatus);
            setQuickAbsentInput("");
        } catch (error) {
            console.error(error);
            toast({ title: "Error fetching students", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async () => {
        setSaving(true);
        try {
            const payload = students.map(student => ({
                student: student.userId,   // User ObjectId from populated profile
                studentId: student.studentId,
                date: attendanceDate,
                status: attendanceData[student._id] || 'Present',
                method: 'Manual',
                class: selectedClass,
                section: selectedSection
            }));

            await apiService.markAttendance(payload);
            toast({ title: "Attendance Saved", description: `Marked ${students.length} students for ${attendanceDate}.` });
        } catch (error: any) {
            toast({ title: "Failed to save", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const markAllPresent = () => {
        const newData: Record<string, string> = {};
        students.forEach(s => newData[s._id] = 'Present');
        setAttendanceData(newData);
        setQuickAbsentInput("");
    };

    const markAllAbsent = () => {
        const newData: Record<string, string> = {};
        students.forEach(s => newData[s._id] = 'Absent');
        setAttendanceData(newData);
        setQuickAbsentInput("");
    };

    const handleQuickAbsentChange = (val: string) => {
        setQuickAbsentInput(val);
        const absentRolls = val.split(',').map(s => s.trim()).filter(Boolean);
        
        const newData: Record<string, string> = {};
        students.forEach(s => {
            if (absentRolls.includes(String(s.rollNumber))) {
                newData[s._id] = 'Absent';
            } else {
                newData[s._id] = 'Present';
            }
        });
        setAttendanceData(newData);
    };

    // QR Logic
    useEffect(() => {
        if (activeTab === 'qr' && !scannerRef.current) {
            // Initialize Scanner
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
                scannerRef.current = null;
            }
        };
    }, [activeTab]);

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (decodedText === lastScanned) return; // Prevent duplicate rapid scans

        setLastScanned(decodedText);
        setScanResult(decodedText);

        try {
            // Assume decodedText is the Student ID
            await apiService.markAttendance({
                studentId: decodedText,
                date: new Date(),
                status: 'Present',
                method: 'QR'
            });

            toast({
                title: "Attendance Marked",
                description: `Student ID: ${decodedText} marked Present.`,
                className: "bg-green-500 text-white"
            });

            // Play success sound (optional)
        } catch (error: any) {
            toast({
                title: "Scan Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const onScanFailure = (error: any) => {
        // console.warn(`Code scan error = ${error}`);
    };

    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>

            <Tabs defaultValue="manual" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="qr">QR Scanner</TabsTrigger>
                </TabsList>

                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Attendance</CardTitle>
                            <CardDescription>Select Class & Section to mark attendance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4 mb-6">
                                <Select onValueChange={setSelectedClass}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={setSelectedSection}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["A","B","C","D"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">Date</Label>
                                    <Input
                                        type="date"
                                        className="w-[160px]"
                                        value={attendanceDate}
                                        onChange={e => setAttendanceDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Fast Attendance Controls */}
                            {students.length > 0 && !loading && (
                                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-indigo-50/50 rounded-md border border-indigo-100">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-sm font-semibold text-indigo-900">Quick Absent (By Roll No)</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="e.g. 5, 12, 18" 
                                                value={quickAbsentInput}
                                                onChange={(e) => handleQuickAbsentChange(e.target.value)}
                                                className="bg-white border-indigo-200 focus-visible:ring-indigo-500"
                                            />
                                        </div>
                                        <p className="text-xs text-indigo-600">Type roll numbers separated by commas. Others will be marked 'Present'.</p>
                                    </div>
                                    <div className="flex items-end gap-2 shrink-0">
                                        <Button variant="outline" className="border-green-200 bg-white text-green-700 hover:bg-green-50" onClick={markAllPresent}>Mark All Present</Button>
                                        <Button variant="outline" className="border-red-200 bg-white text-red-700 hover:bg-red-50" onClick={markAllAbsent}>Mark All Absent</Button>
                                    </div>
                                </div>
                            )}

                            {/* Student List */}
                            <div className="border rounded-md p-4 min-h-[300px]">
                                <div className="grid grid-cols-4 font-bold mb-4 bg-muted p-2 rounded">
                                    <div>Roll No</div>
                                    <div>Name</div>
                                    <div>Student ID</div>
                                    <div>Status</div>
                                </div>
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                ) : students.length === 0 ? (
                                    <p className="text-center text-muted-foreground mt-8">Select class/section to load students or no students found.</p>
                                ) : (
                                    students.map(student => (
                                        <div key={student._id} className="grid grid-cols-4 items-center p-2 border-b last:border-0 hover:bg-muted/50">
                                            <div>{student.rollNumber || "-"}</div>
                                            <div>{student.name}</div>
                                            <div className="text-xs text-muted-foreground">{student.studentId}</div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={attendanceData[student._id] === 'Present' ? "default" : "outline"}
                                                    onClick={() => {
                                                        setAttendanceData({ ...attendanceData, [student._id]: 'Present' });
                                                        setQuickAbsentInput("");
                                                    }}
                                                    className="h-8"
                                                >
                                                    P
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={attendanceData[student._id] === 'Absent' ? "destructive" : "outline"}
                                                    onClick={() => {
                                                        setAttendanceData({ ...attendanceData, [student._id]: 'Absent' });
                                                        setQuickAbsentInput("");
                                                    }}
                                                    className="h-8"
                                                >
                                                    A
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleManualSubmit} disabled={saving || students.length === 0}>
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                    Save Attendance
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="qr">
                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code Scanner</CardTitle>
                            <CardDescription>Scan User ID Card to mark present</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div id="reader" className="w-full max-w-md bg-black rounded-lg overflow-hidden"></div>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Last Scanned:</p>
                                <div className="text-2xl font-mono font-bold">{lastScanned || "Waiting..."}</div>
                            </div>

                            <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm max-w-md">
                                <p className="font-semibold flex items-center gap-2"><QrCode className="h-4 w-4" /> Instructions:</p>
                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                    <li>Ensure valid camera permissions.</li>
                                    <li>Hold ID card steady in front of camera.</li>
                                    <li>System will beep and show success message upon scan.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AttendancePage;
