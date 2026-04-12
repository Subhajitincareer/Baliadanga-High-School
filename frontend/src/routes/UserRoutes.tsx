import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Lazy-loaded components
const StudentLogin = lazy(() => import("@/pages/student/StudentLogin"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StaffLogin = lazy(() => import("@/pages/StaffLogin"));
const StaffDashboard = lazy(() => import("@/pages/StaffDashboard"));

export const StudentRoutes = () => (
  <Routes>
    <Route path="login" element={<StudentLogin />} />
    <Route 
      path="dashboard" 
      element={
        <ProtectedRoute roleRequirement="student">
          <StudentDashboard />
        </ProtectedRoute>
      } 
    />
    <Route path="*" element={<Navigate to="login" replace />} />
  </Routes>
);

export const StaffRoutes = () => (
  <Routes>
    <Route path="login" element={<StaffLogin />} />
    <Route 
      path="dashboard" 
      element={
        <ProtectedRoute roleRequirement="staff">
          <StaffDashboard />
        </ProtectedRoute>
      } 
    />
    <Route path="*" element={<Navigate to="login" replace />} />
  </Routes>
);
