import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { BookOpen, GraduationCap, LogOut, Bell, UserCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentResultCard from '@/components/results/StudentResultCard';
import { Award } from '@/components/ui/award-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Updated interfaces to match MongoDB schema
interface StudentProfile {
  _id: string;
  studentId: string;
  fullName: string;
  rollNumber: string;
  class: string;
  section: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  admissionDate: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

interface StudentResult {
  _id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  examType: 'Unit Test' | 'Mid Term' | 'Final Exam' | 'Annual' | 'Monthly Test';
  academicYear: string;
  subjects: Array<{
    subjectName: string;
    subjectCode: string;
    fullMarks: number;
    obtainedMarks: number;
    grade?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    remarks?: string;
  }>;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  rank?: number;
  publishDate?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  };

  if (loading) {
    return <LoadingSpinner text="Loading student data..." />;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <GraduationCap className="mr-2 h-6 w-6 text-school-primary" />
            Student Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.fullName}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Student Name</CardDescription>
            <CardTitle className="flex items-center text-lg">
              <UserCircle className="mr-2 h-4 w-4" />
              {profile?.fullName}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Class & Roll Number</CardDescription>
            <CardTitle className="flex items-center text-lg">
              <BookOpen className="mr-2 h-4 w-4" />
              {profile?.class}-{profile?.section} | Roll: {profile?.rollNumber}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Performance</CardDescription>
            <CardTitle className={`flex items-center text-lg ${getPerformanceColor(calculateAveragePerformance())}`}>
              <Award className="mr-2 h-4 w-4" />
              {calculateAveragePerformance()}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Exams Taken</CardDescription>
            <CardTitle className="flex items-center text-lg">
              <GraduationCap className="mr-2 h-4 w-4" />
              {results.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="results">Examination Results</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="schedule">Class Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Examination Results</h2>
              <div className="text-sm text-muted-foreground">
                Latest {getLatestResults().length} results
              </div>
            </div>
            
            {results && results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getLatestResults().map(result => (
                  <StudentResultCard key={result._id} result={result} />
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
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Notifications</h2>
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Final Exam Schedule</CardTitle>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      2 days ago
                    </span>
                  </div>
                  <CardDescription>School Administration</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>The final examination schedule has been published. Please check the academic calendar for details.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Midterm Results Declared</CardTitle>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      5 days ago
                    </span>
                  </div>
                  <CardDescription>Examination Department</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>The midterm examination results have been declared. You can view your results in the Examination Results tab.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Parent-Teacher Meeting</CardTitle>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      1 week ago
                    </span>
                  </div>
                  <CardDescription>Class Teacher</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Parent-teacher meeting scheduled for next week. Please inform your guardians about the meeting schedule.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Weekly Class Schedule</h2>
            <p className="text-sm text-muted-foreground">
              Class: {profile?.class}-{profile?.section}
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-background rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted">
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
                    <td className="border p-3 font-medium bg-muted/30">9:00 - 10:00</td>
                    <td className="border p-3">Mathematics</td>
                    <td className="border p-3">Science</td>
                    <td className="border p-3">English</td>
                    <td className="border p-3">Mathematics</td>
                    <td className="border p-3">History</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border p-3 font-medium bg-muted/30">10:00 - 11:00</td>
                    <td className="border p-3">Science</td>
                    <td className="border p-3">English</td>
                    <td className="border p-3">Mathematics</td>
                    <td className="border p-3">Geography</td>
                    <td className="border p-3">Science</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border p-3 font-medium bg-muted/30">11:15 - 12:15</td>
                    <td className="border p-3">History</td>
                    <td className="border p-3">Physical Education</td>
                    <td className="border p-3">Computer Science</td>
                    <td className="border p-3">Science</td>
                    <td className="border p-3">Mathematics</td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="border p-3 font-medium bg-muted/30">12:15 - 1:15</td>
                    <td className="border p-3 text-center italic">Lunch Break</td>
                    <td className="border p-3 text-center italic">Lunch Break</td>
                    <td className="border p-3 text-center italic">Lunch Break</td>
                    <td className="border p-3 text-center italic">Lunch Break</td>
                    <td className="border p-3 text-center italic">Lunch Break</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border p-3 font-medium bg-muted/30">1:15 - 2:15</td>
                    <td className="border p-3">English</td>
                    <td className="border p-3">Art</td>
                    <td className="border p-3">Geography</td>
                    <td className="border p-3">Music</td>
                    <td className="border p-3">English</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border p-3 font-medium bg-muted/30">2:15 - 3:15</td>
                    <td className="border p-3">Computer Science</td>
                    <td className="border p-3">Mathematics</td>
                    <td className="border p-3">Science Lab</td>
                    <td className="border p-3">English</td>
                    <td className="border p-3">Physical Education</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
