import React, { FC } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import { AdminProvider } from "@/contexts/AdminContext";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/common/ScrollToTop";
import { TopLoader } from "@/components/common/TopLoader";

import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import AdmissionManagement from "@/pages/admin/AdmissionManagement";
import StudentResults from "@/pages/admin/StudentResults";
import StudentManagement from '@/pages/admin/StudentManagement';
import StudentDetail from '@/pages/admin/StudentDetail';
import AddStudent from '@/pages/admin/AddStudent';
import PrintableAdmissionForm from '@/pages/admin/PrintableAdmissionForm';

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

// ProtectedRoute for Admin routes
const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdmin = localStorage.getItem("token") !== null &&
    localStorage.getItem("userRole") === "admin";
  return isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
};

// ProtectedRoute for Student routes
const ProtectedStudentRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if JWT token exists and user is a student
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = token !== null && userRole === "student";
  return isLoggedIn ? <>{children}</> : <Navigate to="/student/login" replace />;
};

// ProtectedRoute for Staff routes
const ProtectedStaffRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const STAFF_ROLES = ['teacher', 'principal', 'vice_principal', 'coordinator', 'staff', 'admin'];
  const isLoggedIn = token !== null && STAFF_ROLES.includes(userRole || '');
  return isLoggedIn ? <>{children}</> : <Navigate to="/staff/login" replace />;
};

const App: FC = () => {
  return (
    <Router basename="/">
      <ScrollToTop />
      <TopLoader />
      <StaffProvider>
        <AdminProvider>
          <Routes>
            {/* Admin login */}
            <Route path="/admin" element={<AdminLogin />} />

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
      <Toaster />
    </Router >
  );
};

export default App;
