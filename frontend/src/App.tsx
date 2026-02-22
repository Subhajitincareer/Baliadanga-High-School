import React, { FC } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/common/ScrollToTop";
import { TopLoader } from "@/components/common/TopLoader";

import AdminLogin from "@/pages/AdminLogin";
import AdminSetup from "@/pages/AdminSetup";
import Dashboard from "@/pages/admin/Dashboard";
import AdmissionManagement from "@/pages/admin/AdmissionManagement";
import StudentResults from "@/pages/admin/StudentResults";
import StudentManagement from '@/pages/admin/StudentManagement';
import StudentDetail from '@/pages/admin/StudentDetail';
import AddStudent from '@/pages/admin/AddStudent';
import QuickAddStudents from '@/pages/admin/QuickAddStudents';
import PrintableAdmissionForm from '@/pages/admin/PrintableAdmissionForm';
import AttendancePage from '@/pages/admin/AttendancePage';
import ExamManagement from '@/pages/admin/ExamManagement';
import FeeManagement from '@/pages/admin/FeeManagement';
import { IDCardGenerator } from '@/pages/admin/IDCardGenerator';
import MarksEntry from '@/pages/admin/MarksEntry';
import MidDayMealPage from '@/pages/admin/MidDayMealPage';
import PermissionManagement from '@/pages/admin/PermissionManagement';
import PromotionManagement from '@/pages/admin/PromotionManagement';

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
import RoutinePage from "@/pages/Routine";

import StudentLogin from "@/pages/student/StudentLogin";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StaffLogin from "@/pages/StaffLogin";
import StaffDashboard from "@/pages/StaffDashboard";
import { StaffProvider } from "@/contexts/StaffContext";

// ProtectedRoute for Admin routes — uses AuthContext (httpOnly cookie session)
const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
};

// ProtectedRoute for Student routes
const ProtectedStudentRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isStudent, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated && isStudent ? <>{children}</> : <Navigate to="/student/login" replace />;
};

// ProtectedRoute for Staff routes
const ProtectedStaffRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isStaff, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated && isStaff ? <>{children}</> : <Navigate to="/staff/login" replace />;
};

const App: FC = () => {
  return (
    <Router basename="/">
      <ScrollToTop />
      <TopLoader />
      <AuthProvider>
        <StaffProvider>
          <AdminProvider>
          <Routes>
            {/* Admin login */}
            <Route path="/admin" element={<AdminLogin />} />
            {/* First-run: Headmaster creates admin account */}
            <Route path="/setup" element={<AdminSetup />} />

            {/* Admin protected routes */}
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
            {/* Student routes */}
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute>
                  <StudentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/new"
              element={
                <ProtectedRoute>
                  <AddStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:id"
              element={
                <ProtectedRoute>
                  <StudentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/print-admission-form"
              element={
                <ProtectedRoute>
                  <PrintableAdmissionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute>
                  <ExamManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fees"
              element={
                <ProtectedRoute>
                  <FeeManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/id-cards"
              element={
                <ProtectedRoute>
                  <IDCardGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/marks-entry"
              element={
                <ProtectedRoute>
                  <MarksEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/mid-day-meal"
              element={
                <ProtectedRoute>
                  <MidDayMealPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <ProtectedRoute>
                  <PermissionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/promotions"
              element={
                <ProtectedRoute>
                  <PromotionManagement />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedStudentRoute>
                  <StudentDashboard />
                </ProtectedStudentRoute>
              }
            />

            {/* Staff routes */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedStaffRoute>
                  <StaffDashboard />
                </ProtectedStaffRoute>
              }
            />

            {/* Public routes nested inside Layout */}
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
              <Route path="routine" element={<RoutinePage />} />
              <Route path="results" element={<ResultDisplay />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AdminProvider>
      </StaffProvider>
      </AuthProvider>
      <Toaster />
    </Router >
  );
};

export default App;
