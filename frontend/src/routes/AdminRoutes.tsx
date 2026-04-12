import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";

// Lazy-loaded components
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdmissionManagement = lazy(() => import("@/pages/admin/AdmissionManagement"));
const StudentResults = lazy(() => import("@/pages/admin/StudentResults"));
const StudentManagement = lazy(() => import("@/pages/admin/StudentManagement"));
const StudentDetail = lazy(() => import("@/pages/admin/StudentDetail"));
const AddStudent = lazy(() => import("@/pages/admin/AddStudent"));
const EditStudent = lazy(() => import("@/pages/admin/EditStudent"));
const PrintableAdmissionForm = lazy(() => import("@/pages/admin/PrintableAdmissionForm"));
const AttendancePage = lazy(() => import("@/pages/admin/AttendancePage"));
const ExamManagement = lazy(() => import("@/pages/admin/ExamManagement"));
const FeeManagement = lazy(() => import("@/pages/admin/FeeManagement"));
const IDCardGenerator = lazy(() => import("@/pages/admin/IDCardGenerator").then(m => ({ default: m.IDCardGenerator })));
const MarksEntry = lazy(() => import("@/pages/admin/MarksEntry"));
const MidDayMealPage = lazy(() => import("@/pages/admin/MidDayMealPage"));
const PermissionManagement = lazy(() => import("@/pages/admin/PermissionManagement"));
const PromotionManagement = lazy(() => import("@/pages/admin/PromotionManagement"));
const StaffManagement = lazy(() => import("@/components/admin/StaffManagement").then(m => ({ default: m.StaffManagement })));
const RoutineManagement = lazy(() => import("@/components/admin/RoutineManagement").then(m => ({ default: m.RoutineManagement })));
const ResourceManagement = lazy(() => import("@/components/admin/ResourceManagement").then(m => ({ default: m.ResourceManagement })));
const CourseMaterialManagement = lazy(() => import("@/components/admin/CourseMaterialManagement"));
const EventManagement = lazy(() => import("@/components/admin/EventManagement").then(m => ({ default: m.EventManagement })));
const EventsManagement = lazy(() => import("@/components/admin/EventsManagement"));
const GalleryManagement = lazy(() => import("@/components/admin/GalleryManagement"));
const SiteSettingsManagement = lazy(() => import("@/components/admin/SiteSettingsManagement").then(m => ({ default: m.SiteSettingsManagement })));

const AdminRoutes = () => {
  return (
    <ProtectedRoute roleRequirement="admin">
      <Routes>
        <Route element={<AdminLayout />}>
          {/* Main Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* People Management */}
          <Route path="students" element={<StudentManagement />} />
          <Route path="students/new" element={<AddStudent />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="students/:id/edit" element={<EditStudent />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="id-cards" element={<IDCardGenerator />} />
          <Route path="permissions" element={<PermissionManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          
          {/* Academic Management */}
          <Route path="routines" element={<RoutineManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="marks-entry" element={<MarksEntry />} />
          <Route path="results" element={<StudentResults hideHeader={true} />} />
          <Route path="course-materials" element={<CourseMaterialManagement hideHeader={true} />} />
          <Route path="calendar" element={<EventManagement />} />
          
          {/* Business & Resources */}
          <Route path="fees" element={<FeeManagement />} />
          <Route path="admissions" element={<AdmissionManagement hideHeader={true} />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="mid-day-meal" element={<MidDayMealPage />} />
          <Route path="resources" element={<ResourceManagement hideHeader={true} />} />
          <Route path="events" element={<EventsManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          
          {/* Configuration */}
          <Route path="site-settings" element={<SiteSettingsManagement />} />
          <Route path="print-admission-form" element={<PrintableAdmissionForm />} />

          {/* Index redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        
        {/* Redirect unknown /admin/* paths to dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default AdminRoutes;
