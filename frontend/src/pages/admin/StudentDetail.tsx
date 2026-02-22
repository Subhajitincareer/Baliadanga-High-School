import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, BookOpen, Activity, Printer, CheckCircle, X } from 'lucide-react';
import apiService, { StudentProfile } from '@/services/api';
import { Progress } from '@/components/ui/progress';
import { ReportCardPrint } from '@/components/admin/ReportCardPrint';

const StudentDetail = () => {
    const { id } = useParams<{ id: string }>(); // This will be studentId like "ST-..."
    const [student, setStudent] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [showReportCard, setShowReportCard] = useState(false);
    const [reportCardData, setReportCardData] = useState<any>(null);
    const [reportCardLoading, setReportCardLoading] = useState(false);

    useEffect(() => {
        // We need to fetch by studentId (ST-...) not _id (mongo object id), 
        // unless we change how we linked it. The link was to student.studentId
        // But our API getStudentProfile expects a userId or objectId typically.
        // Let's assume we need to filtering client side or add a specific endpoint. 
        // For safety, let's fetch all and find, or assume the ID passed IS the userId if we changed the link.
        // The link in previous step was `/admin/students/${student.studentId}`.
        // So `id` here is `ST-xxxx`.

        // Actually, `apiService.getStudents()` returns profiles which have `user` object.
        // We should probably implement `apiService.getStudentByStudentId(id)`.

        const fetchStudent = async () => {
            try {
                setLoading(true);
                const allStudents = (await apiService.getStudents()) as any[]; // Fallback strategy
                // Find by studentId matches param
                const found = allStudents.find(s => s.studentId === id);

                if (found) {
                    setStudent(found);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading student profile...</div>;
    }

    if (!student) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-500">Student Not Found</h2>
                <Link to="/admin/dashboard"><Button variant="link">Go Back</Button></Link>
            </div>
        );
    }

    const s = student as any;
    const name = s.name || s.fullName || (s.user?.name) || 'Unknown';
    const email = s.email || s.user?.email || '';

    // Mock Attendance Data
    const attendancePercentage = 85;
    const attendanceHistory = [
        { date: '2025-04-01', status: 'Present' },
        { date: '2025-04-02', status: 'Present' },
        { date: '2025-04-03', status: 'Absent' },
        { date: '2025-04-04', status: 'Present' },
        { date: '2025-04-05', status: 'Present' },
    ];

    return (
        <div className="container py-8 max-w-5xl mx-auto">
            <Link to="/admin/dashboard">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Basic Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-slate-400" />
                            </div>
                            <h2 className="text-2xl font-bold">{name}</h2>
                            <p className="text-muted-foreground">{student.studentId}</p>
                            <div className="mt-4 flex gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Class {student.class}</span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Sec {student.section}</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Roll {student.rollNumber}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm">
                                <Mail className="h-4 w-4 mr-3 text-slate-400" />
                                {email || 'N/A'}
                            </div>
                            <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 mr-3 text-slate-400" />
                                {student.guardianPhone || 'N/A'} (Guardian)
                            </div>
                            <div className="flex items-start text-sm">
                                <MapPin className="h-4 w-4 mr-3 text-slate-400 mt-1" />
                                {student.address || 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details & Attendance */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="details">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="details">Academic Details</TabsTrigger>
                            <TabsTrigger value="attendance">Attendance</TabsTrigger>
                            <TabsTrigger
                              value="results"
                              onClick={async () => {
                                if (exams.length === 0) {
                                  try {
                                    const data = await apiService.getExams();
                                    setExams(Array.isArray(data) ? data : []);
                                  } catch (e) { console.error(e); }
                                }
                              }}
                            >Exam Results</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</h4>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Gender</h4>
                                        <div>{student.gender || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Guardian Name</h4>
                                        <div>{student.guardianName}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Admission Date</h4>
                                        <div>{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="attendance" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attendance Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border rounded-lg">
                                            <span className="text-sm font-medium text-slate-500 mb-1">Total Days</span>
                                            <span className="text-2xl font-bold text-slate-800">120</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-100 rounded-lg">
                                            <span className="text-sm font-medium text-green-600 mb-1">Present</span>
                                            <span className="text-2xl font-bold text-green-700">102</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-100 rounded-lg">
                                            <span className="text-sm font-medium text-red-600 mb-1">Absent</span>
                                            <span className="text-2xl font-bold text-red-700">18</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                            <span className="text-sm font-medium text-blue-600 mb-1">Percentage</span>
                                            <span className="text-2xl font-bold text-blue-700">{attendancePercentage}%</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-8">
                                        <div className="flex justify-between mb-2 text-sm font-medium">
                                            <span className="text-slate-700">Overall Attendance Progress</span>
                                            <span className={attendancePercentage >= 75 ? "text-green-600" : "text-amber-600"}>
                                                {attendancePercentage}%
                                            </span>
                                        </div>
                                        <Progress 
                                            value={attendancePercentage} 
                                            className="h-3 bg-slate-100" 
                                            // By default shadcn progress might use primary color. We can add a custom utility or leave it standard.
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">Target minimum attendance is 75% for exam eligibility.</p>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm border-b pb-2">Recent Attendance Activity</h3>
                                        {attendanceHistory.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${item.status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {item.status === 'Present' ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </p>
                                                        <p className="text-xs text-slate-500">Regular Class Day</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="results" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Print Report Card</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {exams.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No exams found. Click the Exam Results tab to load.</p>
                                    ) : (
                                        <div className="flex gap-3 items-center flex-wrap">
                                            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                                                <SelectTrigger className="w-64">
                                                    <SelectValue placeholder="Select an exam" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {exams.map((e: any) => (
                                                        <SelectItem key={e._id} value={e._id}>{e.name} ({e.type})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                onClick={async () => {
                                                    if (!selectedExamId || !student?._id) return;
                                                    setReportCardLoading(true);
                                                    try {
                                                        const res = await apiService.getReportCard(student._id, selectedExamId);
                                                        setReportCardData(res?.data || res || null);
                                                        setShowReportCard(true);
                                                    } catch (e) {
                                                        console.error(e);
                                                    } finally {
                                                        setReportCardLoading(false);
                                                    }
                                                }}
                                                disabled={!selectedExamId || reportCardLoading}
                                                className="flex items-center gap-2"
                                            >
                                                <Printer className="h-4 w-4" />
                                                {reportCardLoading ? 'Loading...' : 'Print Report Card'}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <ReportCardPrint
                                data={reportCardData}
                                open={showReportCard}
                                onClose={() => setShowReportCard(false)}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
