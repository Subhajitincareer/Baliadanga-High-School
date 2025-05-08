
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import { AdminProvider } from "@/contexts/AdminContext";
import { Toaster } from "@/components/ui/toaster";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import AdmissionManagement from "@/pages/admin/AdmissionManagement";
import StudentResults from "@/pages/admin/StudentResults";
import ResultDisplay from "@/pages/ResultDisplay";
import Announcements from "@/pages/Announcements";
import AnnouncementDetail from "@/pages/AnnouncementDetail";
import Courses from "@/pages/Courses";
import Resources from "@/pages/Resources";
import Events from "@/pages/Events";
import Staff from "@/pages/Staff";
import Portal from "@/pages/Portal";
import NotFound from "@/pages/NotFound";
import Contact from "@/pages/Contact";
import Gallery from "@/pages/Gallery";
import AcademicCalendar from "@/pages/AcademicCalendar";
import Admission from "@/pages/Admission";
import AdmissionStatus from "@/pages/AdmissionStatus";
import StudentLogin from "@/pages/student/StudentLogin";
import StudentDashboard from "@/pages/student/StudentDashboard";

// Create a ProtectedRoute component to guard admin routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

// Create a ProtectedStudentRoute component to guard student routes
const ProtectedStudentRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("supabase.auth.token") !== null;
  
  if (!isLoggedIn) {
    return <Navigate to="/student/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router basename="/">
      <AdminProvider>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admissions"
            element={
              <ProtectedRoute>
                <AdmissionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute>
                <StudentResults />
              </ProtectedRoute>
            }
          />
          
          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedStudentRoute>
                <StudentDashboard />
              </ProtectedStudentRoute>
            }
          />
          
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="announcements/:id" element={<AnnouncementDetail />} />
            <Route path="courses" element={<Courses />} />
            <Route path="resources" element={<Resources />} />
            <Route path="events" element={<Events />} />
            <Route path="staff" element={<Staff />} />
            <Route path="portal" element={<Portal />} />
            <Route path="contact" element={<Contact />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="academic-calendar" element={<AcademicCalendar />} />
            <Route path="admission" element={<Admission />} />
            <Route path="admission-status" element={<AdmissionStatus />} />
            <Route path="results" element={<ResultDisplay />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AdminProvider>
      <Toaster />
    </Router>
  );
}

export default App;

