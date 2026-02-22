import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import apiService, { StudentResult, StudentProfile, Routine, Homework } from '@/services/api';
import { BookOpen, GraduationCap, LogOut, Bell, UserCircle, Clock, CalendarDays, LayoutDashboard, User, Receipt, IndianRupee, AlertCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award } from '@/components/ui/award-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AttendanceGraph } from '@/components/student/AttendanceGraph';
import { ExamResultCard } from '@/components/student/ExamResultCard';
import { AttendanceDetailTable } from '@/components/student/AttendanceDetailTable';
import { ClassScheduleGrid } from '@/components/shared/ClassScheduleGrid';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'holiday' | 'late'>>({});
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, presentDays: 0, totalDays: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sprint 4 state
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoaded, setAnnouncementsLoaded] = useState(false);
  const [feesData, setFeesData] = useState<{ structures: any[], payments: any[], summary: any } | null>(null);
  const [feesLoading, setFeesLoading] = useState(false);
  
  // Sprint 5 state
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [homeworksLoading, setHomeworksLoading] = useState(false);

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
        setAttendanceRecords(attendanceRecords.map((r: any) => ({ date: r.date, status: r.status })));
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

  // --- Sprint 4 helpers ---
  const getTimeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading student data..." />;
  }

  // --- Sprint 4 micro-components (defined after hooks, before JSX) ---
  const ScheduleAutoLoader = ({
    className: cls,
    section,
    onLoaded,
    onLoadingChange
  }: { className: string; section?: string; onLoaded: (d: any[]) => void; onLoadingChange: (v: boolean) => void }) => {
    React.useEffect(() => {
      onLoadingChange(true);
      apiService.getRoutinesByClass(cls, section)
        .then(d => onLoaded(Array.isArray(d) ? d : []))
        .catch(() => onLoaded([]))
        .finally(() => onLoadingChange(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cls, section]);
    return null;
  };

  const AnnouncementsAutoLoader = ({ onLoaded }: { onLoaded: (d: any[]) => void }) => {
    React.useEffect(() => {
      apiService.getAnnouncements()
        .then(d => onLoaded(Array.isArray(d) ? d : []))
        .catch(() => onLoaded([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };

  const HomeworkAutoLoader = ({
    className: cls,
    section,
    onLoaded,
    onLoadingChange
  }: { className: string; section?: string; onLoaded: (d: any[]) => void; onLoadingChange: (v: boolean) => void }) => {
    React.useEffect(() => {
      onLoadingChange(true);
      apiService.getHomeworks({ className: cls, section })
        .then(d => onLoaded(Array.isArray(d) ? d : []))
        .catch(() => onLoaded([]))
        .finally(() => onLoadingChange(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cls, section]);
    return null;
  };

  const FeesTabContent = ({
    feesData,
    feesLoading,
    onLoad
  }: { feesData: any; feesLoading: boolean; onLoad: () => void }) => {
    React.useEffect(() => { onLoad(); }, []);  // eslint-disable-line
    if (feesLoading) return <div className="text-center py-12 text-muted-foreground">Loading fee history…</div>;
    if (!feesData) return <div className="text-center py-12 text-muted-foreground">No fee data found.</div>;
    const { structures, payments, summary } = feesData;
    return (
      <div className="space-y-6">
        {/* Outstanding Banner */}
        {summary?.outstanding > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Outstanding Balance</p>
              <p className="text-sm text-red-700">₹{summary.outstanding.toLocaleString('en-IN')} is due for this academic year.</p>
            </div>
          </div>
        )}
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[{ label: 'Total Due', val: `₹${(summary?.totalDue || 0).toLocaleString('en-IN')}`, color: 'text-gray-800' },
            { label: 'Total Paid', val: `₹${(summary?.totalPaid || 0).toLocaleString('en-IN')}`, color: 'text-green-600' },
            { label: 'Outstanding', val: `₹${(summary?.outstanding || 0).toLocaleString('en-IN')}`, color: summary?.outstanding > 0 ? 'text-red-600' : 'text-green-600' }
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent></Card>
          ))}
        </div>
        {/* Payment History */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" />Payment History</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? <p className="text-muted-foreground text-sm">No payments recorded yet.</p> : (
              <div className="divide-y">
                {payments.map((p: any) => (
                  <div key={p._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{p.feeStructure?.name || 'Payment'}</p>
                      <p className="text-xs text-muted-foreground">{p.receiptNumber} · {new Date(p.paymentDate || p.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">₹{p.amountPaid?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{p.paymentMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

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
              <TabsTrigger value="fees" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <IndianRupee className="mr-2 h-4 w-4" /> Fees
              </TabsTrigger>
              <TabsTrigger value="homework" className="w-full justify-start px-4 py-2 font-medium data-[state=active]:bg-school-primary/10 data-[state=active]:text-school-primary">
                <BookOpen className="mr-2 h-4 w-4" /> Homework
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
                    <div className="text-2xl font-bold">{announcements.filter(a => {
                      const d = new Date(a.createdAt);
                      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
                    }).length || '—'}</div>
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
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

            {/* Attendance Tab — Live AttendanceDetailTable */}
            <TabsContent value="attendance" className="m-0 space-y-4">
              <AttendanceGraph attendanceData={attendanceData} />
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Breakdown</CardTitle>
                  <CardDescription>Your day-by-day attendance record</CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendanceDetailTable
                    attendanceData={attendanceRecords}
                    studentName={profile?.fullName}
                  />
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

            {/* Schedule Tab — Live ClassScheduleGrid */}
            <TabsContent value="schedule" className="m-0 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Weekly Class Schedule</h3>
                  <p className="text-sm text-muted-foreground">Class: {profile?.class}-{profile?.section}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={routinesLoading}
                  onClick={async () => {
                    if (!profile?.class) return;
                    setRoutinesLoading(true);
                    try {
                      const data = await apiService.getRoutinesByClass(profile.class, profile.section);
                      setRoutines(Array.isArray(data) ? data : []);
                    } catch (e) { console.error(e); }
                    finally { setRoutinesLoading(false); }
                  }}
                >
                  {routinesLoading ? 'Loading…' : 'Refresh'}
                </Button>
              </div>
              {routines.length === 0 && !routinesLoading && profile?.class ? (
                // Auto-load on first view
                <ScheduleAutoLoader
                  className={profile.class}
                  section={profile.section}
                  onLoaded={(data) => setRoutines(data)}
                  onLoadingChange={(v) => setRoutinesLoading(v)}
                />
              ) : null}
              <ClassScheduleGrid routines={routines} isLoading={routinesLoading} />
            </TabsContent>

            {/* Notifications Tab — Live Announcements */}
            <TabsContent value="notifications" className="m-0 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Announcements</h3>
                {!announcementsLoaded && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const data = await apiService.getAnnouncements();
                        setAnnouncements(Array.isArray(data) ? data : []);
                        setAnnouncementsLoaded(true);
                      } catch (e) { console.error(e); }
                    }}
                  >
                    Load Announcements
                  </Button>
                )}
              </div>
              {!announcementsLoaded ? (
                <AnnouncementsAutoLoader
                  onLoaded={(data) => { setAnnouncements(data); setAnnouncementsLoaded(true); }}
                />
              ) : announcements.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No announcements yet.</CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {announcements.slice(0, 10).map((a: any) => {
                    const timeAgo = getTimeAgo(new Date(a.createdAt));
                    return (
                      <Card key={a._id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base">{a.title}</CardTitle>
                            <div className="flex gap-1 items-center flex-shrink-0">
                              {a.category && (
                                <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{timeAgo}</span>
                            </div>
                          </div>
                          <CardDescription>{a.targetAudience || 'All'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{a.content}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Fees Tab — NEW in Sprint 4 */}
            <TabsContent value="fees" className="m-0 space-y-4">
              <FeesTabContent
                feesData={feesData}
                feesLoading={feesLoading}
                onLoad={async () => {
                  if (feesData) return;
                  setFeesLoading(true);
                  try {
                    const res = await apiService.getMyFeeHistory();
                    setFeesData(res?.data || null);
                  } catch (e) { console.error(e); }
                  finally { setFeesLoading(false); }
                }}
              />
            </TabsContent>

            {/* Homework Tab — NEW in Sprint 5 */}
            <TabsContent value="homework" className="m-0 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Class Homework</h3>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={homeworksLoading}
                  onClick={async () => {
                    if (!profile?.class) return;
                    setHomeworksLoading(true);
                    try {
                      const data = await apiService.getHomeworks({ className: profile.class, section: profile.section });
                      setHomeworks(Array.isArray(data) ? data : []);
                    } catch (e) { console.error(e); }
                    finally { setHomeworksLoading(false); }
                  }}
                >
                  {homeworksLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>
              
              {homeworks.length === 0 && !homeworksLoading && profile?.class ? (
                <HomeworkAutoLoader
                  className={profile.class}
                  section={profile.section}
                  onLoaded={(data: any) => setHomeworks(data)}
                  onLoadingChange={(v: any) => setHomeworksLoading(v)}
                />
              ) : null}

              {homeworksLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : homeworks.length === 0 ? (
                <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 text-slate-300 mb-4" />
                  No homework assigned yet.
                </CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homeworks.map(hw => (
                    <Card key={hw._id} className="overflow-hidden border-l-4" style={{borderLeftColor: '#4f46e5'}}>
                      <CardHeader className="p-4 pb-2 bg-slate-50 border-b">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-school-primary">{hw.subject}</span>
                          <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                        </div>
                        <CardTitle className="text-base mt-2 line-clamp-1" title={hw.title}>{hw.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-4">
                        <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">{hw.description}</p>
                        <div className="flex justify-between items-center text-xs text-slate-400 mt-auto">
                          <span>Assigned: {new Date(hw.createdAt || '').toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
