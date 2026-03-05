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
import { Loader2, CheckCircle2, XCircle, QrCode, Search, UserCheck, UserMinus, History, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AttendancePage = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("overview");

    // Common State
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // Manual/Overview Shared State
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, string>>({}); // studentId -> status

    // Manual Entry State
    const [saving, setSaving] = useState(false);
    const [quickAbsentInput, setQuickAbsentInput] = useState("");

    // QR State
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Stats
    const stats = {
        total: students.length,
        present: students.filter(s => attendanceData[s.userId] === 'Present' || s.status === 'Present').length,
        absent: students.filter(s => attendanceData[s.userId] === 'Absent' || s.status === 'Absent').length,
        unmarked: students.filter(s => (attendanceData[s.userId] || s.status) === 'N/A').length
    };

    // Load data when class+section+date change
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchAttendance();
        }
    }, [selectedClass, selectedSection, attendanceDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const data = await apiService.getClassAttendance(selectedClass, selectedSection, attendanceDate);
            setStudents(data);
            
            // Sync status to local state for manual editing
            const statusMap: Record<string, string> = {};
            data.forEach((s: any) => {
                statusMap[s.userId] = s.status;
            });
            setAttendanceData(statusMap);
            setQuickAbsentInput("");
        } catch (error) {
            console.error(error);
            toast({ title: "Error fetching attendance", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStatus = async (userId: string, status: string) => {
        try {
            const student = students.find(s => s.userId === userId);
            await apiService.markAttendance({
                student: userId,
                studentId: student?.studentId,
                date: attendanceDate,
                status,
                method: 'Manual',
                class: selectedClass,
                section: selectedSection
            });
            
            setAttendanceData(prev => ({ ...prev, [userId]: status }));
            // Partial update local students list to reflect change immediately in UI if not re-fetching
            setStudents(prev => prev.map(s => s.userId === userId ? { ...s, status } : s));

            toast({ title: `${student?.name} marked ${status}` });
        } catch (error: any) {
            toast({ title: "Failed to update", description: error.message, variant: "destructive" });
        }
    };

    const handleBulkSubmit = async () => {
        setSaving(true);
        try {
            const payload = students.map(student => ({
                student: student.userId,
                studentId: student.studentId,
                date: attendanceDate,
                status: attendanceData[student.userId] || 'Present',
                method: 'Manual',
                class: selectedClass,
                section: selectedSection
            }));

            await apiService.markAttendance(payload);
            toast({ title: "Attendance Saved", description: `Updated ${students.length} records.` });
            fetchAttendance(); // Refresh
        } catch (error: any) {
            toast({ title: "Failed to save", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const markAllPresent = () => {
        const newData: Record<string, string> = { ...attendanceData };
        students.forEach(s => newData[s.userId] = 'Present');
        setAttendanceData(newData);
    };

    const handleQuickAbsentChange = (val: string) => {
        setQuickAbsentInput(val);
        const absentRolls = val.split(',').map(s => s.trim()).filter(Boolean);
        
        const newData: Record<string, string> = {};
        students.forEach(s => {
            if (absentRolls.includes(String(s.rollNumber))) {
                newData[s.userId] = 'Absent';
            } else {
                newData[s.userId] = 'Present';
            }
        });
        setAttendanceData(newData);
    };

    // QR Logic
    useEffect(() => {
        if (activeTab === 'qr' && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
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

    const playBeep = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (context.state === 'suspended') {
                context.resume();
            }
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime); // High pitch beep
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.1);
        } catch (e) {
            console.error("Audio beep failed", e);
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        if (recentScans.some(s => s.studentId === decodedText && (Date.now() - s.time < 30000))) {
            return; // Prevent duplicate scan within 30 seconds
        }

        try {
            const res = await apiService.markAttendance({
                studentId: decodedText,
                date: new Date().toISOString(),
                status: 'Present',
                method: 'QR'
            });

            const studentInfo = res.lastMarkedStudent || { studentId: decodedText, name: "Scanning..." };
            
            setRecentScans(prev => [{ ...studentInfo, time: Date.now() }, ...prev].slice(0, 10));
            playBeep();
            
            toast({
                title: "Scan Successful",
                description: `${studentInfo.name} marked Present.`,
                className: "bg-green-600 text-white border-none"
            });

            // Auto-select class/section if they don't match or aren't set
            if (studentInfo.class && studentInfo.section) {
                // Normalize roman to numeric for the dropdown if needed
                const classMap: any = { 'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10', 'XI': '11', 'XII': '12' };
                const numericClass = classMap[studentInfo.class] || studentInfo.class;
                
                if (selectedClass !== numericClass || selectedSection !== studentInfo.section) {
                    setSelectedClass(numericClass);
                    setSelectedSection(studentInfo.section);
                } else {
                    // Just refresh if we are already in the right view
                    fetchAttendance();
                }
            }
        } catch (error: any) {
            toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
        }
    };

    const onScanFailure = () => {};

    return (
        <div className="container py-8 max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Attendance</h1>
                    <p className="text-muted-foreground">Manage real-time attendance and verify student records.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
                    <Select onValueChange={setSelectedClass} value={selectedClass}>
                        <SelectTrigger className="w-[130px] border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {["5","6","7","8","9","10","11","12"].map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <Select onValueChange={setSelectedSection} value={selectedSection}>
                        <SelectTrigger className="w-[100px] border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Sec" />
                        </SelectTrigger>
                        <SelectContent>
                            {["A","B","C","D"].map(s => <SelectItem key={s} value={s}>Sec {s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <Input 
                        type="date" 
                        value={attendanceDate} 
                        onChange={e => setAttendanceDate(e.target.value)} 
                        className="w-[150px] border-none shadow-none focus-visible:ring-0"
                    />
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100 p-1 rounded-xl w-fit">
                    <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="manual" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Bulk Entry</TabsTrigger>
                    <TabsTrigger value="qr" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2"><QrCode className="h-4 w-4" /> Live Scanner</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Stats Cards */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="bg-indigo-600 text-white overflow-hidden relative">
                                <CardContent className="p-6">
                                    <p className="text-indigo-100 text-sm font-medium">Total Students</p>
                                    <h3 className="text-4xl font-bold mt-1">{stats.total}</h3>
                                    <UserCheck className="absolute top-4 right-4 h-12 w-12 opacity-10" />
                                </CardContent>
                            </Card>
                            <Card className="border-green-100 bg-green-50/30">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-green-700 text-xs font-semibold uppercase tracking-wider">Present</p>
                                        <h3 className="text-2xl font-bold text-green-800">{stats.present}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-red-100 bg-red-50/30">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-red-700 text-xs font-semibold uppercase tracking-wider">Absent</p>
                                        <h3 className="text-2xl font-bold text-red-800">{stats.absent}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                        <XCircle className="h-6 w-6" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 bg-slate-50/30">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Not Marked</p>
                                        <h3 className="text-2xl font-bold text-slate-800">{stats.unmarked}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                        <Loader2 className="h-6 w-6" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Attendance Table */}
                        <Card className="lg:col-span-3 shadow-sm border-slate-200">
                            <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between py-4">
                                <div>
                                    <CardTitle className="text-lg">Class List & Status</CardTitle>
                                    <CardDescription>Real-time checking for {selectedClass} {selectedSection}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={fetchAttendance} disabled={loading}>
                                    <History className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Data
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {selectedClass && selectedSection ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase bg-slate-100 text-slate-600 font-bold border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Roll</th>
                                                    <th className="px-4 py-3">Name</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Update</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan={4} className="py-20 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2" /> Initializing...</td></tr>
                                                ) : students.length === 0 ? (
                                                    <tr><td colSpan={4} className="py-20 text-center text-muted-foreground">No students found for this class.</td></tr>
                                                ) : (
                                                    students.map(s => (
                                                        <tr key={s.userId} className="border-b hover:bg-slate-50/80 transition-colors">
                                                            <td className="px-4 py-3 font-semibold">{s.rollNumber}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium text-slate-900">{s.name}</div>
                                                                <div className="text-[10px] text-slate-400 font-mono tracking-tighter">{s.studentId}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant={s.status === 'Present' ? "default" : s.status === 'Absent' ? "destructive" : "secondary"}>
                                                                    {s.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-1">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleSaveStatus(s.userId, 'Present')}>
                                                                        <UserCheck className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleSaveStatus(s.userId, 'Absent')}>
                                                                        <UserMinus className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={() => handleSaveStatus(s.userId, 'Late')}>
                                                                        <History className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-20 text-center text-muted-foreground">
                                        <Search className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                        Please select Class and Section to view overview.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="manual">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Bulk Entry Mode</CardTitle>
                            <CardDescription>Assign attendance to the whole class at once.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Quick Absent List (By Roll No)</Label>
                                    <Input 
                                        placeholder="Enter roll numbers: 5, 12, 18..." 
                                        value={quickAbsentInput}
                                        onChange={(e) => handleQuickAbsentChange(e.target.value)}
                                        className="bg-white border-slate-200"
                                    />
                                    <p className="text-[10px] text-slate-500 font-medium">Any roll number NOT in this list will be marked 'Present'.</p>
                                </div>
                                <div className="flex items-end gap-2 shrink-0">
                                    <Button variant="outline" className="border-indigo-200 text-indigo-700 bg-white" onClick={markAllPresent}>Mark All Present</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {students.map(s => (
                                    <div key={s.userId} className={`p-3 rounded-lg border transition-all flex items-center justify-between ${attendanceData[s.userId] === 'Absent' ? 'bg-red-50 border-red-200' : 'bg-white hover:border-indigo-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">{s.rollNumber}</div>
                                            <div className="font-medium text-sm">{s.name}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button 
                                                variant={attendanceData[s.userId] === 'Present' ? "default" : "outline"} 
                                                size="sm" 
                                                className="h-7 px-2 text-[10px]"
                                                onClick={() => setAttendanceData({...attendanceData, [s.userId]: 'Present'})}
                                            >P</Button>
                                            <Button 
                                                variant={attendanceData[s.userId] === 'Absent' ? "destructive" : "outline"} 
                                                size="sm" 
                                                className="h-7 px-2 text-[10px]"
                                                onClick={() => setAttendanceData({...attendanceData, [s.userId]: 'Absent'})}
                                            >A</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end border-t pt-6">
                                <Button size="lg" className="px-10" onClick={handleBulkSubmit} disabled={saving || students.length === 0}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Class Attendance
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="qr">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <Card className="md:col-span-12 lg:col-span-5 flex flex-col items-center p-6 border-slate-200 overflow-hidden">
                            <h3 className="text-xl font-bold mb-4 self-start">Scan QR Code</h3>
                            <div id="reader" className="w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden border-8 border-slate-100 mb-6"></div>
                            <div className="w-full p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-sm">
                                <p className="font-bold flex items-center gap-2"><QrCode className="h-4 w-4" /> Scanner Ready</p>
                                <p className="mt-1 opacity-80">Point the camera at the student ID card's QR code to record attendance automatically.</p>
                            </div>
                        </Card>

                        <Card className="md:col-span-12 lg:col-span-7 border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                                <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-indigo-600" /> Recent Scans</CardTitle>
                                <CardDescription>Live feedback from current session</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                {recentScans.length === 0 ? (
                                    <div className="p-20 text-center text-muted-foreground">
                                        <Loader2 className="h-10 w-10 mx-auto mb-4 animate-pulse opacity-10" />
                                        Waitng for first scan...
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {recentScans.map((scan, i) => (
                                            <div key={i} className={`p-4 flex items-center justify-between animate-in slide-in-from-left duration-300 ${i === 0 ? 'bg-green-50/50' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                        {scan.rollNumber || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{scan.name}</div>
                                                        <div className="text-xs text-slate-500">{scan.studentId} • {new Date(scan.time).toLocaleTimeString()}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-green-600 h-6">PRESENT</Badge>
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AttendancePage;
