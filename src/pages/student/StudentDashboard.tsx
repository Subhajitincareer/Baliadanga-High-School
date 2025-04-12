
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, GraduationCap, LogOut, Bell, UserCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentResultCard from '@/components/results/StudentResultCard';
import { StudentResults as StudentResultsType } from '@/integrations/supabase/client';
import { Award } from '@/components/ui/award-icon';

interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  roll_number: string;
  class_name: string;
  email: string;
}

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<StudentResultsType[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/student/login');
        return;
      }
      
      fetchStudentData(session.user.id);
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/student/login');
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  // Temporarily modify this function to work without the students table
  const fetchStudentData = async (userId: string) => {
    try {
      // For now, we'll create a temporary profile since we don't have a students table yet
      const tempProfile: StudentProfile = {
        id: userId,
        user_id: userId,
        full_name: "Student User",
        roll_number: "TEMP-001",
        class_name: "Sample Class",
        email: "student@example.com"
      };
      
      setProfile(tempProfile);
      
      // Fetch student results using the temporary roll number
      const { data: resultsData, error: resultsError } = await supabase
        .from('student_results')
        .select('*')
        .eq('roll_number', tempProfile.roll_number)
        .order('exam_date', { ascending: false });
        
      if (resultsError) throw resultsError;
      setResults(resultsData || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: error.message || "Could not load your student information",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/student/login');
  };

  const calculateAveragePerformance = () => {
    if (!results || results.length === 0) return 0;
    
    const totalPercentage = results.reduce((sum, result) => 
      sum + (result.marks / result.total_marks) * 100, 0);
    
    return Math.round(totalPercentage / results.length);
  };
  
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600'; 
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <p>Loading student data...</p>
      </div>
    );
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
            Welcome back, {profile?.full_name}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Student Name</CardDescription>
            <CardTitle className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              {profile?.full_name}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Class & Roll Number</CardDescription>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              {profile?.class_name} | Roll: {profile?.roll_number}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Performance</CardDescription>
            <CardTitle className={`flex items-center ${getPerformanceColor(calculateAveragePerformance())}`}>
              <Award className="mr-2 h-4 w-4" />
              {calculateAveragePerformance()}%
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
          <h2 className="text-xl font-bold mb-4">Your Examination Results</h2>
          {results && results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(result => (
                <StudentResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No examination results found.</p>
          )}
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
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <h2 className="text-xl font-bold mb-4">Weekly Class Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2">Time/Day</th>
                  <th className="border p-2">Monday</th>
                  <th className="border p-2">Tuesday</th>
                  <th className="border p-2">Wednesday</th>
                  <th className="border p-2">Thursday</th>
                  <th className="border p-2">Friday</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">9:00 - 10:00</td>
                  <td className="border p-2">Mathematics</td>
                  <td className="border p-2">Science</td>
                  <td className="border p-2">English</td>
                  <td className="border p-2">Mathematics</td>
                  <td className="border p-2">History</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">10:00 - 11:00</td>
                  <td className="border p-2">Science</td>
                  <td className="border p-2">English</td>
                  <td className="border p-2">Mathematics</td>
                  <td className="border p-2">Geography</td>
                  <td className="border p-2">Science</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">11:15 - 12:15</td>
                  <td className="border p-2">History</td>
                  <td className="border p-2">Physical Education</td>
                  <td className="border p-2">Computer Science</td>
                  <td className="border p-2">Science</td>
                  <td className="border p-2">Mathematics</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">12:15 - 1:15</td>
                  <td className="border p-2">Lunch Break</td>
                  <td className="border p-2">Lunch Break</td>
                  <td className="border p-2">Lunch Break</td>
                  <td className="border p-2">Lunch Break</td>
                  <td className="border p-2">Lunch Break</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">1:15 - 2:15</td>
                  <td className="border p-2">English</td>
                  <td className="border p-2">Art</td>
                  <td className="border p-2">Geography</td>
                  <td className="border p-2">Music</td>
                  <td className="border p-2">English</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">2:15 - 3:15</td>
                  <td className="border p-2">Computer Science</td>
                  <td className="border p-2">Mathematics</td>
                  <td className="border p-2">Science Lab</td>
                  <td className="border p-2">English</td>
                  <td className="border p-2">Physical Education</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
