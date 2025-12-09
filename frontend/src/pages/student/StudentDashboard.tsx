import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import apiService, { StudentResult, StudentProfile } from '@/services/api';
import { BookOpen, GraduationCap, LogOut, Bell, UserCircle, Clock, CalendarDays, LayoutDashboard, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award } from '@/components/ui/award-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AttendanceGraph } from '@/components/student/AttendanceGraph';
import { ExamResultCard } from '@/components/student/ExamResultCard';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'holiday' | 'late'>>({});
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, presentDays: 0, totalDays: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchStudentData = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/student/login');
        return;
      }

      // Fetch student profile
      const profileData = await apiService.getStudentProfile(userId);

      // Fetch student results
      const resultsData = await apiService.getStudentResults(userId);

      // Fetch Attendance
      try {
        const attendanceRecords = await apiService.getStudentAttendance(userId);
        const attData: Record<string, any> = {};
        let presentCount = 0;
        let totalCount = 0;

        attendanceRecords.forEach((record: any) => {
          const dateKey = new Date(record.date).toISOString().split('T')[0];
          attData[dateKey] = record.status.toLowerCase();
          if (record.status === 'Present' || record.status === 'Late') presentCount++;
          if (record.status !== 'Holiday') totalCount++;
        });

        setAttendanceData(attData);
        setAttendanceStats({
          percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
          presentDays: presentCount,
          totalDays: totalCount
        });

      } catch (attError) {
        console.error('Failed to fetch attendance', attError);
      }

      setProfile(profileData);
      setResults(resultsData || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      if (!token || userRole !== 'student') {
        navigate('/student/login');
        return;
      }

      fetchStudentData();
    };

    checkAuth();
  }, [navigate, fetchStudentData]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/student/login');
    } catch (error) {
      // Even if API call fails, clear local storage and redirect
      localStorage.clear();
      navigate('/student/login');
    }
  };

  const calculateAveragePerformance = () => {
    if (!results || results.length === 0) return 0;

    const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
    return Math.round(totalPercentage / results.length);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getLatestResults = () => {
    return results
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);
  };

  if (loading) {
    return <LoadingSpinner text="Loading student data..." />;
  }

  return (
    <div className="flex h-screen bg-gray-100/40">
      {/* Sidebar */}
      <div className="hidden border-r bg-white md:block md:w-64 lg:w-72 flex-shrink-0">
        <div className="flex h-16 items-center border-b px-6">
          <span className="font-bold text-lg text-school-primary flex items-center">
            <GraduationCap className="mr-2 h-6 w-6" />
            Student Portal
          </span>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <TabsList className="flex h-full flex-col items-start justify-start space-y-1 bg-transparent p-4">
              <TabsTrigger value="dashboard" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="attendance" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <CalendarDays className="mr-2 h-4 w-4" /> Attendance
              </TabsTrigger>
              <TabsTrigger value="results" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <Award className="mr-2 h-4 w-4" /> Results
              </TabsTrigger>
              <TabsTrigger value="schedule" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <Clock className="mr-2 h-4 w-4" /> Schedule
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <Bell className="mr-2 h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="profile" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <User className="mr-2 h-4 w-4" /> Profile
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b bg-white px-6 md:hidden justify-between">
          <span className="font-bold text-lg text-school-primary flex items-center">
            <GraduationCap className="mr-2 h-6 w-6" />
            Student Portal
          </span>
          <Button variant="ghost" size="icon" onClick={() => {/* Toggle sidebar logic could go here */ }}>
            {/* <Menu className="h-6 w-6" /> */}
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.fullName}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} className="space-y-4">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class & Roll</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profile?.class}-{profile?.section}</div>
                    <p className="text-xs text-muted-foreground">Roll: {profile?.rollNumber}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceStats.percentage}%</div>
                    <p className="text-xs text-muted-foreground">{attendanceStats.presentDays} days present</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getPerformanceColor(calculateAveragePerformance())}`}>
                      {calculateAveragePerformance()}%
                    </div>
                    <p className="text-xs text-muted-foreground">Average Score</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">Unread messages</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AttendanceGraph attendanceData={attendanceData} />
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Results</CardTitle>
                    <CardDescription>Your latest academic performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getLatestResults().slice(0, 3).map(result => (
                        <div key={result._id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{result.examType}</p>
                            <p className="text-xs text-muted-foreground">{new Date(result.createdAt || 0).toLocaleDateString()}</p>
                          </div>
                          <div className={`font-bold ${getPerformanceColor(result.percentage)}`}>
                            {result.percentage}%
                          </div>
                        </div>
                      ))}
                      {results.length === 0 && <p className="text-muted-foreground text-sm">No results available yet.</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="m-0 space-y-4">
              <AttendanceGraph attendanceData={attendanceData} />
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed daily attendance logs will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="m-0 space-y-4">
              {results && results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getLatestResults().map(result => (
                    <ExamResultCard key={result._id} result={result} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No examination results found.
                      <br />
                      <span className="text-sm">Results will appear here once published by your teachers.</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="m-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Class Schedule</CardTitle>
                  <CardDescription>Class: {profile?.class}-{profile?.section}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border p-3 text-left font-semibold">Time/Day</th>
                          <th className="border p-3 text-left font-semibold">Monday</th>
                          <th className="border p-3 text-left font-semibold">Tuesday</th>
                          <th className="border p-3 text-left font-semibold">Wednesday</th>
                          <th className="border p-3 text-left font-semibold">Thursday</th>
                          <th className="border p-3 text-left font-semibold">Friday</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-muted/50">
                          <td className="border p-3 font-medium bg-muted/20">9:00 - 10:00</td>
                          <td className="border p-3">Mathematics</td>
                          <td className="border p-3">Science</td>
                          <td className="border p-3">English</td>
                          <td className="border p-3">Mathematics</td>
                          <td className="border p-3">History</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="border p-3 font-medium bg-muted/20">10:00 - 11:00</td>
                          <td className="border p-3">Science</td>
                          <td className="border p-3">English</td>
                          <td className="border p-3">Mathematics</td>
                          <td className="border p-3">Geography</td>
                          <td className="border p-3">Science</td>
                        </tr>
                        <tr className="bg-muted/10">
                          <td className="border p-3 font-medium bg-muted/20">11:00 - 11:30</td>
                          <td colSpan={5} className="border p-3 text-center italic text-muted-foreground">Break</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="border p-3 font-medium bg-muted/20">11:30 - 12:30</td>
                          <td className="border p-3">History</td>
                          <td className="border p-3">CS</td>
                          <td className="border p-3">Sports</td>
                          <td className="border p-3">Physics</td>
                          <td className="border p-3">Math</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="m-0 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Notifications</h3>
                <Button variant="outline" size="sm">Mark all as read</Button>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">Final Exam Schedule</CardTitle>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <CardDescription>School Administration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">The final examination schedule has been published.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">Midterm Results Declared</CardTitle>
                      <span className="text-xs text-muted-foreground">5 days ago</span>
                    </div>
                    <CardDescription>Examination Dept</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">The midterm results are out! Check your results tab.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="m-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <div className="font-medium text-lg">{profile?.fullName}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
                      <div className="font-medium text-lg">{profile?.rollNumber}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Class</label>
                      <div className="font-medium text-lg">{profile?.class}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Section</label>
                      <div className="font-medium text-lg">{profile?.section}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="font-medium text-lg">{profile?.email}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="font-medium text-lg">{profile?.phoneNumber}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <div className="font-medium text-lg">{profile?.address}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Guardian Name</label>
                      <div className="font-medium text-lg">{profile?.guardianName}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Guardian Phone</label>
                      <div className="font-medium text-lg">{profile?.guardianPhone}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
